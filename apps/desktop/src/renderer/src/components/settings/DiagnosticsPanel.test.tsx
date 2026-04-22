import { describe, expect, it, vi } from 'vitest';
import {
  formatRelativeTime,
  formatRunIdPreview,
  handleExportBundle,
  handleOpenLogFolder,
  loadDiagnosticEvents,
  truncateMessage,
} from './DiagnosticsPanel';

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    schemaVersion: 1 as const,
    ts: Date.now(),
    level: 'error' as const,
    code: 'PROVIDER_ERROR',
    scope: 'generate',
    runId: 'abcdefgh1234',
    fingerprint: 'fp',
    message: 'boom',
    stack: undefined,
    transient: false,
    count: 1,
    context: undefined,
    ...overrides,
  };
}

describe('loadDiagnosticEvents', () => {
  it('returns events when listEvents resolves with rows', async () => {
    const listEvents = vi
      .fn()
      .mockResolvedValue({ schemaVersion: 1, events: [row({ id: 1 }), row({ id: 2 })] });
    const api = { listEvents } as unknown as Parameters<typeof loadDiagnosticEvents>[0];

    const result = await loadDiagnosticEvents(api, false);

    expect(result).toHaveLength(2);
    expect(listEvents).toHaveBeenCalledWith({
      schemaVersion: 1,
      limit: 100,
      includeTransient: false,
    });
  });

  it('returns empty array when api/listEvents is missing', async () => {
    expect(await loadDiagnosticEvents(undefined, false)).toEqual([]);
    expect(
      await loadDiagnosticEvents({} as Parameters<typeof loadDiagnosticEvents>[0], false),
    ).toEqual([]);
  });

  it('forwards includeTransient=true to listEvents when the filter is toggled on', async () => {
    const listEvents = vi.fn().mockResolvedValue({ schemaVersion: 1, events: [] });
    const api = { listEvents } as unknown as Parameters<typeof loadDiagnosticEvents>[0];

    await loadDiagnosticEvents(api, true);

    expect(listEvents).toHaveBeenCalledWith(expect.objectContaining({ includeTransient: true }));
  });
});

describe('handleOpenLogFolder', () => {
  it('invokes window.codesign.diagnostics.openLogFolder when available', async () => {
    const openLogFolder = vi.fn().mockResolvedValue(undefined);
    await handleOpenLogFolder({ openLogFolder } as unknown as Parameters<
      typeof handleOpenLogFolder
    >[0]);
    expect(openLogFolder).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when the api or method is missing', async () => {
    await expect(handleOpenLogFolder(undefined)).resolves.toBeUndefined();
  });
});

describe('handleExportBundle', () => {
  it('exports and reveals the resulting path in the file manager', async () => {
    const exportDiagnostics = vi.fn().mockResolvedValue('/tmp/bundle.zip');
    const showItemInFolder = vi.fn();
    const result = await handleExportBundle({
      exportDiagnostics,
      showItemInFolder,
    } as unknown as Parameters<typeof handleExportBundle>[0]);
    expect(result).toBe('/tmp/bundle.zip');
    expect(showItemInFolder).toHaveBeenCalledWith('/tmp/bundle.zip');
  });
});

describe('formatting helpers', () => {
  it('truncates long messages with an ellipsis', () => {
    expect(truncateMessage('short')).toBe('short');
    expect(truncateMessage('x'.repeat(100), 10)).toBe(`${'x'.repeat(9)}…`);
  });

  it('shows the first 8 runId characters, with a dash fallback', () => {
    expect(formatRunIdPreview('abcdefgh1234')).toBe('abcdefgh');
    expect(formatRunIdPreview(undefined)).toBe('—');
  });

  it('formats relative time in s/m/h/d', () => {
    const now = 1_000_000_000_000;
    expect(formatRelativeTime(now - 5_000, now)).toBe('5s');
    expect(formatRelativeTime(now - 120_000, now)).toBe('2m');
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe('3h');
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe('2d');
  });
});
