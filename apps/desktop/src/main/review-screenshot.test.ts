import { describe, expect, it, vi } from 'vitest';
import { buildReviewScreenshotAttachment, shouldAttachReviewScreenshot } from './review-screenshot';

describe('shouldAttachReviewScreenshot', () => {
  it('matches review-style follow-ups', () => {
    expect(shouldAttachReviewScreenshot('Can you check what you did?')).toBe(true);
    expect(shouldAttachReviewScreenshot('Something looks off in the UI')).toBe(true);
    expect(shouldAttachReviewScreenshot('Please review the latest screen')).toBe(true);
    expect(shouldAttachReviewScreenshot('这个看起来不对，帮我检查一下')).toBe(true);
  });

  it('ignores normal generation prompts', () => {
    expect(shouldAttachReviewScreenshot('Design a fintech landing page')).toBe(false);
    expect(shouldAttachReviewScreenshot('Continue the existing flow')).toBe(false);
  });
});

describe('buildReviewScreenshotAttachment', () => {
  it('returns an image attachment for review prompts with html', async () => {
    const capture = vi.fn(async () => ({
      data: 'pngbase64',
      mimeType: 'image/png' as const,
      width: 1280,
      height: 900,
    }));

    await expect(
      buildReviewScreenshotAttachment({
        prompt: 'Can you review what you changed?',
        previousHtml: '<html><body>Hello</body></html>',
        capture,
      }),
    ).resolves.toEqual([{ type: 'image', data: 'pngbase64', mimeType: 'image/png' }]);
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('skips capture when the prompt is not a review', async () => {
    const capture = vi.fn(async () => null);

    await expect(
      buildReviewScreenshotAttachment({
        prompt: 'Design a new dashboard',
        previousHtml: '<html><body>Hello</body></html>',
        capture,
      }),
    ).resolves.toEqual([]);
    expect(capture).not.toHaveBeenCalled();
  });
});
