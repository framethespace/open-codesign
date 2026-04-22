/**
 * Wiring test for diagnostics:v1:log → recordDiagnosticEvent.
 *
 * Proves that renderer `error`-level entries are persisted into the
 * diagnostic_events table, while `info` and `warn` are log-only.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const handlers = new Map<string, (...args: unknown[]) => unknown>();

vi.mock('./electron-runtime', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, fn: (...args: unknown[]) => unknown) => {
      handlers.set(channel, fn);
    }),
  },
  app: { getPath: vi.fn(() => '/tmp'), getVersion: vi.fn(() => '0.0.0-test') },
  shell: { openPath: vi.fn(), showItemInFolder: vi.fn() },
}));

vi.mock('./logger', () => ({
  getLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
  getLogPath: vi.fn(() => '/tmp/main.log'),
  logsDir: vi.fn(() => '/tmp/logs'),
}));

vi.mock('./config', () => ({
  configPath: vi.fn(() => '/tmp/config.toml'),
}));

import { registerDiagnosticsIpc } from './diagnostics-ipc';
import { initInMemoryDb, listDiagnosticEvents } from './snapshots-db';

function invoke(channel: string, payload: unknown): unknown {
  const fn = handlers.get(channel);
  if (!fn) throw new Error(`No handler registered for ${channel}`);
  return fn({}, payload);
}

beforeEach(() => {
  handlers.clear();
});

afterEach(() => {
  handlers.clear();
});

describe('diagnostics:v1:log persistence', () => {
  it('persists error-level entries into diagnostic_events', () => {
    const db = initInMemoryDb();
    registerDiagnosticsIpc(db);

    invoke('diagnostics:v1:log', {
      schemaVersion: 1,
      level: 'error',
      scope: 'renderer:app',
      message: 'something exploded',
      data: { code: 'SOME_CODE', runId: 'run-abc' },
      stack: 'Error: boom\n    at foo',
    });

    const rows = listDiagnosticEvents(db, { includeTransient: true });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.level).toBe('error');
    expect(rows[0]?.code).toBe('SOME_CODE');
    expect(rows[0]?.scope).toBe('renderer:app');
    expect(rows[0]?.runId).toBe('run-abc');
    expect(rows[0]?.message).toBe('something exploded');
  });

  it('falls back to RENDERER_ERROR when data.code is absent', () => {
    const db = initInMemoryDb();
    registerDiagnosticsIpc(db);

    invoke('diagnostics:v1:log', {
      schemaVersion: 1,
      level: 'error',
      scope: 'renderer:app',
      message: 'boom',
    });

    const rows = listDiagnosticEvents(db, { includeTransient: true });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe('RENDERER_ERROR');
  });

  it('does NOT persist info or warn level entries', () => {
    const db = initInMemoryDb();
    registerDiagnosticsIpc(db);

    invoke('diagnostics:v1:log', {
      schemaVersion: 1,
      level: 'info',
      scope: 'renderer:app',
      message: 'hello',
    });
    invoke('diagnostics:v1:log', {
      schemaVersion: 1,
      level: 'warn',
      scope: 'renderer:app',
      message: 'careful',
    });

    const rows = listDiagnosticEvents(db, { includeTransient: true });
    expect(rows).toHaveLength(0);
  });

  it('is a no-op when db is null', () => {
    registerDiagnosticsIpc(null);
    expect(() =>
      invoke('diagnostics:v1:log', {
        schemaVersion: 1,
        level: 'error',
        scope: 'renderer:app',
        message: 'boom',
      }),
    ).not.toThrow();
  });
});
