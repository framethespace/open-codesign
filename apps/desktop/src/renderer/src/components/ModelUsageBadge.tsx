import { useT } from '@open-codesign/i18n';
import { useEffect, useState } from 'react';
import { useCodesignStore } from '../store';

interface ModelMetadataState {
  contextWindow: number | null;
  maxTokens: number | null;
}

export interface UsageMetrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  contextWindow: number | null;
  percentUsed: number | null;
}

export function formatCompactTokenCount(count: number): string {
  if (count >= 1_000_000) return `${trimDecimal(count / 1_000_000)}M`;
  if (count >= 1_000) return `${trimDecimal(count / 1_000)}k`;
  return `${Math.round(count)}`;
}

export function formatFullTokenCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(count));
}

export function formatUsdAmount(costUsd: number): string {
  if (costUsd >= 100) return `$${costUsd.toFixed(0)}`;
  if (costUsd >= 1) return `$${costUsd.toFixed(2)}`;
  if (costUsd >= 0.01) return `$${costUsd.toFixed(3)}`;
  if (costUsd > 0) return `$${costUsd.toFixed(4)}`;
  return '$0';
}

function trimDecimal(value: number): string {
  const rounded = value >= 100 ? value.toFixed(0) : value.toFixed(1);
  return rounded.replace(/\.0$/, '');
}

export function buildUsageMetrics(input: {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  contextWindow: number | null;
}): UsageMetrics {
  const totalTokens = input.inputTokens + input.outputTokens;
  const percentUsed =
    input.contextWindow && input.contextWindow > 0
      ? Math.max(0, Math.min(100, Math.round((totalTokens / input.contextWindow) * 100)))
      : null;
  return {
    totalTokens,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    costUsd: input.costUsd,
    contextWindow: input.contextWindow,
    percentUsed,
  };
}

export function ModelUsageBadge() {
  const t = useT();
  const config = useCodesignStore((s) => s.config);
  const lastUsage = useCodesignStore((s) => s.lastUsage);
  const [meta, setMeta] = useState<ModelMetadataState | null>(null);

  const providerId = config?.provider ?? null;
  const modelId = config?.modelPrimary ?? null;

  useEffect(() => {
    if (!providerId || !modelId || !window.codesign?.models?.getMetadata) {
      setMeta(null);
      return;
    }
    let cancelled = false;
    void window.codesign.models
      .getMetadata({ providerId, modelId })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setMeta({
            contextWindow: result.contextWindow,
            maxTokens: result.maxTokens,
          });
          return;
        }
        setMeta(null);
      })
      .catch(() => {
        if (!cancelled) setMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [modelId, providerId]);

  if (!lastUsage) return null;

  const metrics = buildUsageMetrics({
    inputTokens: lastUsage.inputTokens,
    outputTokens: lastUsage.outputTokens,
    costUsd: lastUsage.costUsd,
    contextWindow: meta?.contextWindow ?? null,
  });
  const summaryParts = [
    metrics.percentUsed !== null ? `${metrics.percentUsed}% ctx` : null,
    `${formatCompactTokenCount(metrics.totalTokens)} tok`,
    metrics.costUsd > 0 ? formatUsdAmount(metrics.costUsd) : null,
  ].filter((part): part is string => part !== null);

  if (summaryParts.length === 0) return null;

  const remainingPercent =
    metrics.percentUsed !== null ? Math.max(0, 100 - metrics.percentUsed) : null;
  const contextLines =
    metrics.percentUsed !== null && metrics.contextWindow !== null
      ? [
          t('topbar.usage.contextWindow', { defaultValue: 'Context window' }),
          `${metrics.percentUsed}% used (${remainingPercent}% left)`,
          `${formatFullTokenCount(metrics.totalTokens)} / ${formatCompactTokenCount(metrics.contextWindow)} tokens used`,
        ]
      : null;
  const usageLines = [
    t('topbar.usage.apiUsage', { defaultValue: 'API usage' }),
    `${formatCompactTokenCount(metrics.inputTokens)} in · ${formatCompactTokenCount(metrics.outputTokens)} out`,
    metrics.costUsd > 0
      ? `${formatUsdAmount(metrics.costUsd)} ${t('topbar.usage.lastRequest', { defaultValue: 'last request' })}`
      : t('topbar.usage.tokensOnly', { defaultValue: 'Tokens captured for the last request' }),
  ];
  const tooltipLabel = [contextLines, usageLines]
    .filter((section): section is string[] => section !== null)
    .map((section) => section.join('  '))
    .join('  ');

  return (
    <span className="relative inline-flex group">
      <span
        className="inline-flex items-center gap-[6px] h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[10px] text-[11px] text-[var(--color-text-secondary)] tabular-nums"
        style={{ fontFamily: 'var(--font-mono)' }}
        aria-label={tooltipLabel}
      >
        {summaryParts.join(' · ')}
      </span>
      <span className="pointer-events-none absolute right-0 top-full z-50 mt-[8px] w-max max-w-[300px] rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-[16px] py-[14px] text-[13px] leading-[1.35] text-[var(--color-text-primary)] opacity-0 shadow-[var(--shadow-card)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {contextLines ? (
          <span className="block">
            <span className="block text-[var(--color-text-muted)]">{contextLines[0]}</span>
            <span className="mt-[6px] block text-[15px] font-semibold">{contextLines[1]}</span>
            <span className="mt-[2px] block text-[15px] font-semibold">{contextLines[2]}</span>
          </span>
        ) : null}
        <span
          className={`block ${contextLines ? 'mt-[12px] border-t border-[var(--color-border-muted)] pt-[12px]' : ''}`}
        >
          <span className="block text-[var(--color-text-muted)]">{usageLines[0]}</span>
          <span className="mt-[6px] block text-[15px] font-semibold">{usageLines[1]}</span>
          <span className="mt-[2px] block text-[15px] font-semibold">{usageLines[2]}</span>
        </span>
      </span>
    </span>
  );
}
