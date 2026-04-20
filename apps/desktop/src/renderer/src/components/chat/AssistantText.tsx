import { useT } from '@open-codesign/i18n';

interface AssistantTextProps {
  text: string;
  /** When true, append three animated dots after the text to signal streaming. */
  streaming?: boolean;
}

/**
 * Plain assistant prose. We intentionally avoid a markdown dependency at
 * this stage — Workstream B's Phase 1 only streams plain text, and the
 * existing chat history fields are plain strings too. A future commit
 * can swap this for marked() when richer output actually arrives.
 */
export function AssistantText({ text, streaming }: AssistantTextProps) {
  const t = useT();
  return (
    <div className="space-y-[var(--space-1)]">
      <div className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {t('sidebar.chat.claudeLabel')}
      </div>
      <div className="text-[14px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words [&>p+p]:mt-[var(--space-2)]">
        {text}
        {streaming ? (
          <span
            className="inline-flex ml-[var(--space-1)] align-baseline"
            aria-label={t('sidebar.chat.streamingLabel')}
          >
            <span className="codesign-stream-dot">.</span>
            <span className="codesign-stream-dot" style={{ animationDelay: '150ms' }}>
              .
            </span>
            <span className="codesign-stream-dot" style={{ animationDelay: '300ms' }}>
              .
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
