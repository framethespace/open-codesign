import { useT } from '@open-codesign/i18n';

interface UserMessageProps {
  text: string;
  attachedSkills?: string[];
}

export function UserMessage({ text, attachedSkills }: UserMessageProps) {
  const t = useT();
  return (
    <div className="space-y-[var(--space-1)] pl-[var(--space-4)]">
      <div className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {t('sidebar.chat.youLabel')}
      </div>
      <div className="text-[14px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
        {text}
      </div>
      {attachedSkills && attachedSkills.length > 0 ? (
        <div className="flex flex-wrap gap-[var(--space-1)] pt-[var(--space-1)]">
          {attachedSkills.map((s) => (
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
