import { useT } from '@open-codesign/i18n';
import type { ChatContextPreview } from '@open-codesign/shared';
import { useEffect, useState } from 'react';

interface UserMessageProps {
  text: string;
  attachedSkills?: string[];
  contextBadges?: string[];
  contextPreviews?: ChatContextPreview[];
}

const previewUrlCache = new Map<string, string | null>();
const previewUrlPending = new Map<string, Promise<string | null>>();

async function loadPreviewUrl(path: string): Promise<string | null> {
  const cached = previewUrlCache.get(path);
  if (cached !== undefined) return cached;
  const pending = previewUrlPending.get(path);
  if (pending) return pending;
  const next = window.codesign?.readLocalImageDataUrl?.({ path }) ?? Promise.resolve(null);
  previewUrlPending.set(path, next);
  try {
    const resolved = await next;
    previewUrlCache.set(path, resolved);
    return resolved;
  } finally {
    previewUrlPending.delete(path);
  }
}

function ContextPreviewCard({ preview }: { preview: ChatContextPreview }) {
  const t = useT();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    () => previewUrlCache.get(preview.path) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    void loadPreviewUrl(preview.path).then((resolved) => {
      if (!cancelled) setPreviewUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [preview.path]);

  return (
    <div className="w-[176px] overflow-hidden rounded-[14px] border border-[var(--color-accent)]/20 bg-[var(--color-surface)] shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,var(--color-background-secondary),var(--color-surface))]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${t('canvas.contextBadge')} — ${preview.label}`}
            className="h-full w-full object-contain bg-white"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full animate-pulse bg-[linear-gradient(135deg,var(--color-background-secondary),var(--color-surface))]"
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-center gap-[8px] px-[10px] py-[8px]">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {t('canvas.contextBadge')}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--color-text-secondary)]">
          {preview.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Claude-style user message: right-aligned bubble with subtle accent tint
 * background. No "You" label — bubble alignment carries the role signal.
 */
export function UserMessage({
  text,
  attachedSkills,
  contextBadges,
  contextPreviews,
}: UserMessageProps) {
  const t = useT();
  const visibleContextBadges = contextPreviews?.length ? [] : (contextBadges ?? []);
  const hasMeta =
    (attachedSkills && attachedSkills.length > 0) ||
    visibleContextBadges.length > 0 ||
    (contextPreviews && contextPreviews.length > 0);
  return (
    <div className="flex flex-col items-end gap-[var(--space-1)] pl-[var(--space-6)]">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-[var(--space-3)] py-[var(--space-2)] text-[14px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
        {text}
      </div>
      {contextPreviews && contextPreviews.length > 0 ? (
        <div className="flex max-w-[85%] flex-wrap justify-end gap-[8px]">
          {contextPreviews.map((preview) => (
            <ContextPreviewCard key={`${preview.kind}:${preview.path}`} preview={preview} />
          ))}
        </div>
      ) : null}
      {hasMeta ? (
        <div className="flex flex-wrap justify-end gap-[var(--space-1)]">
          {visibleContextBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/8 px-[var(--space-2)] py-[var(--space-0_5)] text-[var(--text-2xs)] text-[var(--color-text-secondary)]"
            >
              {badge}
            </span>
          ))}
          {attachedSkills?.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-[var(--space-2)] py-[var(--space-0_5)] text-[var(--text-2xs)] text-[var(--color-text-muted)]"
            >
              {t(`sidebar.chat.skill.${s}`, { defaultValue: s })}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
