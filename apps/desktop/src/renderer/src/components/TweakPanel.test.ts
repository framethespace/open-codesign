import { describe, expect, it, vi } from 'vitest';
import { postLiveTweakMessages } from './TweakPanel';

describe('postLiveTweakMessages', () => {
  it('sends both the JSX bridge payload and the HTML edit-mode payload', () => {
    const postMessage = vi.fn();
    const win = { postMessage } as Pick<Window, 'postMessage'>;

    const sent = postLiveTweakMessages(win, {
      'color-accent': '#AF2323',
      radius: 28,
      enabled: true,
    });

    expect(sent).toBe(true);
    expect(postMessage).toHaveBeenNthCalledWith(
      1,
      {
        type: 'codesign:tweaks:update',
        tokens: {
          'color-accent': '#AF2323',
          radius: 28,
          enabled: true,
        },
      },
      '*',
    );
    expect(postMessage).toHaveBeenNthCalledWith(
      2,
      {
        type: '__edit_mode_set_keys',
        edits: {
          'color-accent': '#AF2323',
          radius: '28',
          enabled: 'true',
        },
      },
      '*',
    );
  });

  it('returns false when there is no preview window', () => {
    expect(postLiveTweakMessages(null, { accent: '#fff' })).toBe(false);
  });
});
