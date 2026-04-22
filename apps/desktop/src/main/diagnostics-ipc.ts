/**
 * Diagnostics IPC handlers (main process).
 *
 * All channels are namespaced diagnostics:v1:* and carry schemaVersion: 1
 * on every object payload.
 *
 * Channels:
 *   diagnostics:v1:log            — relay a renderer log entry to electron-log
 *   diagnostics:v1:openLogFolder  — open the logs directory in Finder/Explorer
 *   diagnostics:v1:exportDiagnostics — bundle logs + metadata into a zip
 *   diagnostics:v1:showItemInFolder  — reveal a file in the OS file manager
 */

import { readFile } from 'node:fs/promises';
import { CodesignError, computeFingerprint } from '@open-codesign/shared';
import type BetterSqlite3 from 'better-sqlite3';
import { configPath } from './config';
import { app, ipcMain, shell } from './electron-runtime';
import { getLogPath, getLogger, logsDir } from './logger';
import { recordDiagnosticEvent } from './snapshots-db';

type Database = BetterSqlite3.Database;

const logger = getLogger('diagnostics-ipc');

type LogLevel = 'info' | 'warn' | 'error';

export interface RendererLogEntry {
  schemaVersion: 1;
  level: LogLevel;
  scope: string;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}

function parseLogEntry(raw: unknown): RendererLogEntry {
  if (typeof raw !== 'object' || raw === null) {
    throw new CodesignError('diagnostics:v1:log expects an object payload', 'IPC_BAD_INPUT');
  }
  const r = raw as Record<string, unknown>;
  if (r['schemaVersion'] !== 1) {
    throw new CodesignError('diagnostics:v1:log requires schemaVersion: 1', 'IPC_BAD_INPUT');
  }
  if (r['level'] !== 'info' && r['level'] !== 'warn' && r['level'] !== 'error') {
    throw new CodesignError('level must be info | warn | error', 'IPC_BAD_INPUT');
  }
  if (typeof r['scope'] !== 'string' || r['scope'].trim().length === 0) {
    throw new CodesignError('scope must be a non-empty string', 'IPC_BAD_INPUT');
  }
  if (typeof r['message'] !== 'string') {
    throw new CodesignError('message must be a string', 'IPC_BAD_INPUT');
  }
  if (r['data'] !== undefined && (typeof r['data'] !== 'object' || r['data'] === null)) {
    throw new CodesignError('data must be an object if provided', 'IPC_BAD_INPUT');
  }
  if (r['stack'] !== undefined && typeof r['stack'] !== 'string') {
    throw new CodesignError('stack must be a string if provided', 'IPC_BAD_INPUT');
  }
  const base: RendererLogEntry = {
    schemaVersion: 1,
    level: r['level'] as LogLevel,
    scope: r['scope'] as string,
    message: r['message'] as string,
  };
  if (r['data'] !== undefined) {
    base.data = r['data'] as Record<string, unknown>;
  }
  if (r['stack'] !== undefined) {
    base.stack = r['stack'] as string;
  }
  return base;
}

/** Regex that matches common API key shapes; used to redact config content. */
const API_KEY_RE = /(sk-[a-zA-Z0-9]{20,}|[a-f0-9]{32,})/g;

async function readConfigRedacted(): Promise<string> {
  try {
    const raw = await readFile(configPath(), 'utf8');
    // Strip prompt / history fields first (multi-line values between quotes).
    const noPrompts = raw.replace(/^(prompt|history)\s*=\s*"""[\s\S]*?"""/gm, '');
    return noPrompts.replace(API_KEY_RE, '***REDACTED***');
  } catch {
    return '(config not readable)';
  }
}

async function buildDiagnosticsZip(): Promise<string> {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const { Zip } = await import('zip-lib');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const destDir = app.getPath('downloads');
  const destPath = path.join(destDir, `open-codesign-diagnostics-${timestamp}.zip`);

  // Collect log content
  let logContent: string;
  try {
    logContent = await readFile(getLogPath(), 'utf8');
  } catch {
    logContent = '(log file not readable)';
  }

  const configContent = await readConfigRedacted();

  const meta = JSON.stringify(
    {
      schemaVersion: 1,
      version: app.getVersion(),
      platform: process.platform,
      electron: process.versions.electron,
      node: process.versions.node,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );

  // Stage files in a temp dir then zip
  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codesign-diag-'));
  try {
    const logStagePath = path.join(stagingDir, 'main.log');
    const configStagePath = path.join(stagingDir, 'config-redacted.toml');
    const metaStagePath = path.join(stagingDir, 'metadata.json');

    await Promise.all([
      fs.writeFile(logStagePath, logContent, 'utf8'),
      fs.writeFile(configStagePath, configContent, 'utf8'),
      fs.writeFile(metaStagePath, meta, 'utf8'),
    ]);

    await fs.mkdir(destDir, { recursive: true });

    const zip = new Zip();
    zip.addFile(logStagePath, 'main.log');
    zip.addFile(configStagePath, 'config-redacted.toml');
    zip.addFile(metaStagePath, 'metadata.json');
    await zip.archive(destPath);
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true });
  }

  return destPath;
}

export function registerDiagnosticsIpc(db: Database | null): void {
  ipcMain.handle('diagnostics:v1:log', (_e: unknown, raw: unknown): void => {
    const entry = parseLogEntry(raw);
    const scopedLogger = getLogger(`renderer:${entry.scope}`);
    const fields: Record<string, unknown> = {};
    if (entry.data !== undefined) {
      Object.assign(fields, entry.data);
    }
    // Stack is forwarded as a separate key, never concatenated into the message,
    // so it doesn't duplicate what electron-log already captures per-error.
    if (entry.stack !== undefined) {
      fields['stack'] = entry.stack;
    }
    switch (entry.level) {
      case 'info':
        scopedLogger.info(entry.message, fields);
        break;
      case 'warn':
        scopedLogger.warn(entry.message, fields);
        break;
      case 'error':
        scopedLogger.error(entry.message, fields);
        break;
    }

    // Persist only error-level renderer entries into diagnostic_events.
    if (entry.level === 'error' && db !== null) {
      const dataCode =
        entry.data !== undefined && typeof entry.data['code'] === 'string'
          ? (entry.data['code'] as string)
          : undefined;
      const code = dataCode ?? 'RENDERER_ERROR';
      const runId =
        entry.data !== undefined && typeof entry.data['runId'] === 'string'
          ? (entry.data['runId'] as string)
          : undefined;
      recordDiagnosticEvent(db, {
        level: 'error',
        code,
        scope: entry.scope,
        runId,
        fingerprint: computeFingerprint({ errorCode: code, stack: entry.stack }),
        message: entry.message,
        stack: entry.stack,
        transient: false,
      });
    }
  });

  ipcMain.handle('diagnostics:v1:openLogFolder', async (): Promise<void> => {
    await shell.openPath(logsDir());
  });

  ipcMain.handle('diagnostics:v1:exportDiagnostics', async (): Promise<string> => {
    try {
      const zipPath = await buildDiagnosticsZip();
      logger.info('diagnostics.exported', { path: zipPath });
      return zipPath;
    } catch (err) {
      logger.error('diagnostics.export.fail', {
        message: err instanceof Error ? err.message : String(err),
      });
      throw new CodesignError(
        `Failed to export diagnostics: ${err instanceof Error ? err.message : String(err)}`,
        'DIAGNOSTICS_EXPORT_FAILED',
        { cause: err },
      );
    }
  });

  ipcMain.handle('diagnostics:v1:showItemInFolder', (_e: unknown, raw: unknown): void => {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new CodesignError(
        'diagnostics:v1:showItemInFolder expects a non-empty path string',
        'IPC_BAD_INPUT',
      );
    }
    shell.showItemInFolder(raw);
  });
}
