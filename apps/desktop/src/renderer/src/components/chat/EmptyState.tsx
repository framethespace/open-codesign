import { useT } from '@open-codesign/i18n';
import { Sparkles } from 'lucide-react';

interface StarterCard {
  labelKey: string;
  promptKey: string;
}

const STARTER_CARDS: StarterCard[] = [
  { labelKey: 'emptyState.starters.landing', promptKey: 'starterPrompts.landing' },
  { labelKey: 'emptyState.starters.pitch', promptKey: 'starterPrompts.pitch' },
  { labelKey: 'emptyState.starters.mobile', promptKey: 'starterPrompts.mobile' },
  { labelKey: 'emptyState.starters.dashboard', promptKey: 'starterPrompts.dashboard' },
];

export interface EmptyStateProps {
  onPickStarter: (prompt: string) => void;
}

/**
 * Sidebar empty state — shown when there are no chat messages yet.
 * Mirrors the hub EmptyState starter pattern but scaled for a narrow column.
 */
export function EmptyState({ onPickStarter }: EmptyStateProps) {
  const t = useT();
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-8)]">
      <Sparkles
        className="w-[32px] h-[32px] text-[var(--color-accent)] opacity-60"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="space-y-[var(--space-1)]">
        <h2
          className="text-[var(--text-lg)] leading-[var(--leading-heading)] text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {t('sidebar.empty.title')}
        </h2>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-[var(--leading-body)]">
          {t('sidebar.empty.subtitle')}
        </p>
      </div>
      <div className="w-full flex flex-col gap-[var(--space-2)] mt-[var(--space-2)]">
        {STARTER_CARDS.map((card) => (
          <button
            key={card.labelKey}
            type="button"
            onClick={() => onPickStarter(t(card.promptKey))}
            className="w-full text-left rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2_5)] text-[13px] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-colors duration-[var(--duration-faster)]"
          >
            {t(card.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
