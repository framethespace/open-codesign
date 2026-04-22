import { useEffect, useState } from 'react';
import type { PreviewThumbnail } from '../../../../preload/index';

const thumbCache = new Map<string, PreviewThumbnail | null>();
const pendingCache = new Map<string, Promise<PreviewThumbnail | null>>();

async function loadThumbnail(html: string): Promise<PreviewThumbnail | null> {
  const cached = thumbCache.get(html);
  if (cached !== undefined) return cached;
  const pending = pendingCache.get(html);
  if (pending) return pending;
  const next = window.codesign?.capturePreviewThumbnail(html) ?? Promise.resolve(null);
  pendingCache.set(html, next);
  try {
    const resolved = await next;
    thumbCache.set(html, resolved);
    return resolved;
  } finally {
    pendingCache.delete(html);
  }
}

export function HtmlPreviewThumbnail({
  html,
  alt,
}: {
  html: string | null;
  alt: string;
}) {
  const [thumb, setThumb] = useState<PreviewThumbnail | null>(() =>
    html ? (thumbCache.get(html) ?? null) : null,
  );

  useEffect(() => {
    if (!html) {
      setThumb(null);
      return;
    }
    let cancelled = false;
    void loadThumbnail(html).then((resolved) => {
      if (!cancelled) setThumb(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [html]);

  if (!html) return null;

  return (
    <div className="relative h-[72px] w-[112px] overflow-hidden rounded-[12px] border border-[var(--color-border-muted)] bg-[linear-gradient(135deg,var(--color-background-secondary),var(--color-surface))] shadow-[0_8px_24px_rgba(15,23,42,0.08)] shrink-0">
      {thumb ? (
        <img
          src={thumb.dataUrl}
          alt={alt}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div
          className="h-full w-full animate-pulse bg-[linear-gradient(135deg,var(--color-background-secondary),var(--color-surface))]"
          aria-hidden
        />
      )}
      <div className="pointer-events-none absolute inset-x-[6px] bottom-[6px] rounded-full bg-[color-mix(in_srgb,var(--color-surface)_86%,transparent)] px-[7px] py-[2px] text-[10px] font-medium tracking-[0.02em] text-[var(--color-text-secondary)] backdrop-blur-[6px]">
        Live preview
      </div>
    </div>
  );
}
