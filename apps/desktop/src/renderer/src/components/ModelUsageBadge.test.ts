import { describe, expect, it } from 'vitest';
import {
  buildUsageMetrics,
  formatCompactTokenCount,
  formatFullTokenCount,
  formatUsdAmount,
} from './ModelUsageBadge';

describe('formatCompactTokenCount', () => {
  it('formats small token counts without suffixes', () => {
    expect(formatCompactTokenCount(987)).toBe('987');
  });

  it('formats thousands with a compact k suffix', () => {
    expect(formatCompactTokenCount(62_000)).toBe('62k');
    expect(formatCompactTokenCount(12_450)).toBe('12.4k');
  });

  it('formats millions with a compact M suffix', () => {
    expect(formatCompactTokenCount(2_540_000)).toBe('2.5M');
  });
});

describe('formatFullTokenCount', () => {
  it('adds thousands separators', () => {
    expect(formatFullTokenCount(258_000)).toBe('258,000');
  });
});

describe('formatUsdAmount', () => {
  it('keeps low costs readable', () => {
    expect(formatUsdAmount(0.0084)).toBe('$0.0084');
    expect(formatUsdAmount(0.12)).toBe('$0.120');
  });

  it('rounds higher costs more tightly', () => {
    expect(formatUsdAmount(3.456)).toBe('$3.46');
    expect(formatUsdAmount(123.45)).toBe('$123');
  });
});

describe('buildUsageMetrics', () => {
  it('computes total tokens and percent used against the context window', () => {
    expect(
      buildUsageMetrics({
        inputTokens: 48_000,
        outputTokens: 14_000,
        costUsd: 0.42,
        contextWindow: 258_000,
      }),
    ).toMatchObject({
      totalTokens: 62_000,
      percentUsed: 24,
    });
  });

  it('omits percent when context is unavailable', () => {
    expect(
      buildUsageMetrics({
        inputTokens: 48_000,
        outputTokens: 14_000,
        costUsd: 0.42,
        contextWindow: null,
      }).percentUsed,
    ).toBeNull();
  });
});
