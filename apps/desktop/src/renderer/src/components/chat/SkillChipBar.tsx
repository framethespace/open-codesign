import { useT } from '@open-codesign/i18n';
import { Star } from 'lucide-react';
import { BUILTIN_SKILLS, type BuiltinSkillId } from '../../store';

interface SkillChipBarProps {
  attached: BuiltinSkillId[];
  onToggle: (skill: BuiltinSkillId) => void;
  disabled?: boolean;
}

/**
 * Row of toggle chips above the prompt input. Each chip maps to a builtin
 * skill body that the main process prepends to the system prompt on the
 * next turn. Selection is consumed on submit (store.clearAttachedSkills).
 *
 * Deliberately NOT AI-suggested in v0.2 — chips are a fixed set of 4.
 */
export function SkillChipBar({ attached, onToggle, disabled }: SkillChipBarProps) {
  const t = useT();
  return (
    <fieldset
      className="flex flex-wrap gap-[var(--space-1_5)] border-0 p-0 m-0"
      aria-label={t('sidebar.chat.skills.label')}
    >
      <legend className="sr-only">{t('sidebar.chat.skills.label')}</legend>
      {BUILTIN_SKILLS.map((skill) => {
        const active = attached.includes(skill);
        return (
          <button
            key={skill}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onToggle(skill)}
            className={`inline-flex items-center gap-[var(--space-1)] rounded-full px-[var(--space-2_5)] py-[var(--space-1)] text-[12px] border transition-colors duration-[var(--duration-faster)] ${
              active
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Star
              className={`w-3 h-3 ${active ? 'fill-current' : ''}`}
              strokeWidth={active ? 0 : 2}
              aria-hidden
            />
            <span>{t(`sidebar.chat.skill.${skill}`, { defaultValue: skill })}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
