import type { ReflectionCaptureResult } from './visual-reflection';

export interface PromptImageAttachment {
  type: 'image';
  data: string;
  mimeType: ReflectionCaptureResult['mimeType'];
}

const REVIEW_PROMPT_PATTERNS = [
  /\breview\b/i,
  /\baudit\b/i,
  /\binspect\b/i,
  /\bverify\b/i,
  /\bvalidate\b/i,
  /\bcritique\b/i,
  /\bqa\b/i,
  /\bcheck\b/i,
  /\bwhat did you do\b/i,
  /\bwhat changed\b/i,
  /\blooks? off\b/i,
  /\blooks? wrong\b/i,
  /\blooks? right\b/i,
  /\bdoesn['’]t look right\b/i,
  /\bdoes not look right\b/i,
  /\bsomething('?s| is) off\b/i,
  /看起来不对|不对劲|检查|审查|复查/,
];

export function shouldAttachReviewScreenshot(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return false;
  return REVIEW_PROMPT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export async function buildReviewScreenshotAttachment(input: {
  prompt: string;
  previousHtml: string | null;
  capture: (artifactSource: string) => Promise<ReflectionCaptureResult | null>;
}): Promise<PromptImageAttachment[]> {
  if (!shouldAttachReviewScreenshot(input.prompt)) return [];
  const html = input.previousHtml?.trim() ?? '';
  if (html.length === 0) return [];
  const screenshot = await input.capture(html);
  if (!screenshot) return [];
  return [{ type: 'image', data: screenshot.data, mimeType: screenshot.mimeType }];
}
