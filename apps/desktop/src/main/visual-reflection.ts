import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSrcdoc } from '@open-codesign/runtime';
import { BrowserWindow } from './electron-runtime';
import { getLogger } from './logger';

const CAPTURE_TIMEOUT_MS = 4500;
const SETTLE_AFTER_LOAD_MS = 1400;
const log = getLogger('main:visual-reflection');

export interface ReflectionCaptureResult {
  data: string;
  mimeType: 'image/png';
  width: number;
  height: number;
}

export async function captureArtifactScreenshot(
  artifactSource: string,
): Promise<ReflectionCaptureResult | null> {
  const srcdoc = buildSrcdoc(artifactSource);
  const captureDir = join(tmpdir(), 'open-codesign-captures');
  const filePath = join(
    captureDir,
    `capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.html`,
  );

  const width = 1280;
  const height = 900;
  const win = new BrowserWindow({
    show: false,
    width,
    height,
    backgroundColor: '#ffffff',
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      offscreen: true,
    },
  });

  try {
    await mkdir(captureDir, { recursive: true });
    await writeFile(filePath, srcdoc, 'utf8');

    const wc = win.webContents as unknown as {
      once: (event: string, listener: (...args: unknown[]) => void) => void;
    };
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else resolve();
      };
      const timeout = setTimeout(
        () => finish(new Error('visual reflection timed out')),
        CAPTURE_TIMEOUT_MS,
      );
      wc.once('did-finish-load', () => {
        setTimeout(() => {
          clearTimeout(timeout);
          finish();
        }, SETTLE_AFTER_LOAD_MS);
      });
      wc.once('did-fail-load', (_event, errorCode, errorDescription) => {
        clearTimeout(timeout);
        finish(new Error(`did-fail-load (${String(errorCode)}): ${String(errorDescription)}`));
      });
      void win.loadFile(filePath).catch((err: unknown) => {
        clearTimeout(timeout);
        finish(err instanceof Error ? err : new Error(String(err)));
      });
    });
    const image = await win.webContents.capturePage({ x: 0, y: 0, width, height });
    return {
      data: image.toPNG().toString('base64'),
      mimeType: 'image/png',
      width,
      height,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.warn('capture.fail', { message });
    return null;
  } finally {
    try {
      if (!win.isDestroyed()) win.destroy();
    } catch {
      /* noop */
    }
    try {
      await unlink(filePath);
    } catch {
      /* noop */
    }
  }
}
