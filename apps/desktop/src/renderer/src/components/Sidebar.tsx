import { useT } from '@open-codesign/i18n';
import type { LocalInputFile, OnboardingState } from '@open-codesign/shared';
import { FolderOpen, Link2, Paperclip, X } from 'lucide-react';
import { type ClipboardEvent, useEffect, useRef, useState } from 'react';
import { useAgentStream } from '../hooks/useAgentStream';
import { useCodesignStore } from '../store';
import { ModelSwitcher } from './ModelSwitcher';
import { AddMenu } from './chat/AddMenu';
import { ChatMessageList } from './chat/ChatMessageList';
import { CommentChipBar } from './chat/CommentChipBar';
import { EmptyState } from './chat/EmptyState';
import { PromptInput, type PromptInputHandle } from './chat/PromptInput';

export interface SidebarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
}

interface ComposerContextItem {
  key: string;
  label: string;
  icon: 'file' | 'url' | 'designSystem';
  actionLabel?: string;
}

const attachmentPreviewCache = new Map<string, string | null>();
const attachmentPreviewPending = new Map<string, Promise<string | null>>();

function isImageAttachment(file: LocalInputFile): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name);
}

async function loadAttachmentPreview(path: string): Promise<string | null> {
  const cached = attachmentPreviewCache.get(path);
  if (cached !== undefined) return cached;
  const pending = attachmentPreviewPending.get(path);
  if (pending) return pending;
  const next = window.codesign?.readLocalImageDataUrl?.({ path }) ?? Promise.resolve(null);
  attachmentPreviewPending.set(path, next);
  try {
    const resolved = await next;
    attachmentPreviewCache.set(path, resolved);
    return resolved;
  } finally {
    attachmentPreviewPending.delete(path);
  }
}

function AttachmentChip({
  file,
  isCanvasImport,
  removeLabel,
  canvasLabel,
  onRemove,
}: {
  file: LocalInputFile;
  isCanvasImport: boolean;
  removeLabel: string;
  canvasLabel: string;
  onRemove: () => void;
}) {
  const isImage = isImageAttachment(file);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    isImage ? (attachmentPreviewCache.get(file.path) ?? null) : null,
  );

  useEffect(() => {
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }
    let cancelled = false;
    void loadAttachmentPreview(file.path).then((resolved) => {
      if (!cancelled) setPreviewUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [file.path, isImage]);

  return (
    <span
      className={`inline-flex max-w-full items-center gap-[8px] border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[11px] text-[var(--color-text-secondary)] ${previewUrl ? 'rounded-[14px] px-[6px] py-[5px]' : 'rounded-full px-[10px] py-[5px]'}`}
      title={file.path}
    >
      {previewUrl ? (
        <span className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-[10px] border border-[var(--color-border-muted)] bg-[var(--color-surface)]">
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        </span>
      ) : (
        <ContextIcon icon="file" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate max-w-[180px]">{file.name}</span>
        {isCanvasImport ? (
          <span className="block text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {canvasLabel}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <X className="w-3 h-3" aria-hidden />
      </button>
    </span>
  );
}

export function buildComposerContextItems(input: {
  inputFiles: LocalInputFile[];
  referenceUrl: string;
  config: OnboardingState | null;
}): ComposerContextItem[] {
  const items: ComposerContextItem[] = input.inputFiles.map((file) => ({
    key: `file:${file.path}`,
    label: file.name,
    icon: 'file',
    actionLabel: file.path,
  }));

  const referenceUrl = input.referenceUrl.trim();
  if (referenceUrl.length > 0) {
    items.push({
      key: 'reference-url',
      label: referenceUrl,
      icon: 'url',
      actionLabel: referenceUrl,
    });
  }

  const designSystem = input.config?.designSystem ?? null;
  if (designSystem) {
    items.push({
      key: 'design-system',
      label: designSystem.summary,
      icon: 'designSystem',
      actionLabel: designSystem.rootPath,
    });
  }

  return items;
}

function ContextIcon({ icon }: { icon: ComposerContextItem['icon'] }) {
  if (icon === 'file') return <Paperclip className="w-3.5 h-3.5" aria-hidden />;
  if (icon === 'url') return <Link2 className="w-3.5 h-3.5" aria-hidden />;
  return <FolderOpen className="w-3.5 h-3.5" aria-hidden />;
}

/**
 * Sidebar v2 — chat-style conversation pane.
 *
 * Replaces the single-shot prompt box with a chat history backed by the
 * chat_messages SQLite table. See docs/plans/2026-04-20-agentic-sidebar-
 * custom-endpoint-design.md §5 for the full spec. Multi-design switcher
 * stays deferred; the design name + "+" header shows the single current
 * design only.
 */
export function Sidebar({ prompt, setPrompt, onSubmit }: SidebarProps) {
  const t = useT();
  const config = useCodesignStore((s) => s.config);
  const isGenerating = useCodesignStore(
    (s) => s.isGenerating && s.generatingDesignId === s.currentDesignId,
  );
  const cancelGeneration = useCodesignStore((s) => s.cancelGeneration);
  const inputFiles = useCodesignStore((s) => s.inputFiles);
  const canvasScene = useCodesignStore((s) => s.canvasScene);
  const canvasImportedFiles = useCodesignStore((s) => s.canvasImportedFiles);
  const canvasRevision = useCodesignStore((s) => s.canvasRevision);
  const lastGeneratedCanvasRevision = useCodesignStore((s) => s.lastGeneratedCanvasRevision);
  const referenceUrl = useCodesignStore((s) => s.referenceUrl);
  const setReferenceUrl = useCodesignStore((s) => s.setReferenceUrl);
  const pickInputFiles = useCodesignStore((s) => s.pickInputFiles);
  const addInputFiles = useCodesignStore((s) => s.addInputFiles);
  const removeInputFile = useCodesignStore((s) => s.removeInputFile);
  const removeCanvasImportedFile = useCodesignStore((s) => s.removeCanvasImportedFile);
  const pickDesignSystemDirectory = useCodesignStore((s) => s.pickDesignSystemDirectory);
  const clearDesignSystem = useCodesignStore((s) => s.clearDesignSystem);
  const lastUsage = useCodesignStore((s) => s.lastUsage);
  const pushToast = useCodesignStore((s) => s.pushToast);

  const chatMessages = useCodesignStore((s) => s.chatMessages);
  const chatLoaded = useCodesignStore((s) => s.chatLoaded);
  const streamingAssistantText = useCodesignStore((s) => s.streamingAssistantText);
  const pendingToolCalls = useCodesignStore((s) => s.pendingToolCalls);
  const loadChatForCurrentDesign = useCodesignStore((s) => s.loadChatForCurrentDesign);
  const currentDesignId = useCodesignStore((s) => s.currentDesignId);
  const designs = useCodesignStore((s) => s.designs);
  const sidebarCollapsed = useCodesignStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useCodesignStore((s) => s.setSidebarCollapsed);

  // Mount useAgentStream here so streaming events route into the chat
  // as soon as the Sidebar is in the tree — matches the lifecycle of
  // chat visibility without needing an app-level hook.
  useAgentStream();

  const promptInputRef = useRef<PromptInputHandle>(null);
  const handlePickStarter = (starterPrompt: string): void => {
    setPrompt(starterPrompt);
    promptInputRef.current?.focus();
  };

  const designSystem = config?.designSystem ?? null;
  const currentDesign = designs.find((d) => d.id === currentDesignId) ?? null;
  const hasCanvasContext = Boolean(
    (canvasScene && canvasScene.elements.length > 0) || canvasImportedFiles.length > 0,
  );
  const canvasWillBeSent = hasCanvasContext && canvasRevision > lastGeneratedCanvasRevision;
  const visibleFiles = [...inputFiles, ...canvasImportedFiles].filter(
    (file, index, all) => all.findIndex((candidate) => candidate.path === file.path) === index,
  );
  const contextItems = buildComposerContextItems({
    inputFiles: visibleFiles,
    referenceUrl,
    config,
  });

  useEffect(() => {
    if (currentDesignId && !chatLoaded) {
      void loadChatForCurrentDesign();
    }
  }, [currentDesignId, chatLoaded, loadChatForCurrentDesign]);

  const activeModelLine =
    config?.hasKey && config.modelPrimary ? config.modelPrimary : t('sidebar.chat.noModel');
  const lastTokens = lastUsage ? lastUsage.inputTokens + lastUsage.outputTokens : null;

  async function handlePromptPaste(event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> {
    const clipboardData = event.clipboardData;
    const items = Array.from(clipboardData.items ?? []);
    const imageFiles = items
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    const clipboardFiles = Array.from(clipboardData.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    const allImageFiles = [...imageFiles, ...clipboardFiles].filter(
      (file, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.type === file.type,
        ) === index,
    );
    const plainText = clipboardData.getData('text/plain').trim();
    if (allImageFiles.length === 0) {
      if (plainText.length > 0) return;
      if (!window.codesign?.saveClipboardImage) return;
      event.preventDefault();
      try {
        const fallback = await window.codesign.saveClipboardImage({
          name: 'pasted-screenshot.png',
        });
        if (!fallback) {
          pushToast({
            variant: 'info',
            title: t('sidebar.chat.paste.emptyTitle'),
            description: t('sidebar.chat.paste.emptyDescription'),
          });
          return;
        }
        addInputFiles([fallback]);
        pushToast({
          variant: 'success',
          title: t('sidebar.chat.paste.attachedTitle'),
          description: t('sidebar.chat.paste.attachedDescription', { count: 1 }),
        });
      } catch (error) {
        pushToast({
          variant: 'error',
          title: t('sidebar.chat.paste.failedTitle'),
          description:
            error instanceof Error ? error.message : t('sidebar.chat.paste.failedDescription'),
        });
      }
      return;
    }
    if (!window.codesign?.savePastedImage) return;
    event.preventDefault();
    const savedFiles: LocalInputFile[] = [];
    try {
      for (const file of allImageFiles) {
        const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
        const ext =
          file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png';
        const name =
          file.name && file.name.trim().length > 0 ? file.name : `pasted-screenshot.${ext}`;
        savedFiles.push(await window.codesign.savePastedImage({ name, bytes }));
      }
      addInputFiles(savedFiles);
      pushToast({
        variant: 'success',
        title: t('sidebar.chat.paste.attachedTitle'),
        description: t('sidebar.chat.paste.attachedDescription', { count: savedFiles.length }),
      });
    } catch (error) {
      pushToast({
        variant: 'error',
        title: t('sidebar.chat.paste.failedTitle'),
        description:
          error instanceof Error ? error.message : t('sidebar.chat.paste.failedDescription'),
      });
    }
  }

  return (
    <aside
      className="flex flex-col h-full overflow-x-hidden border-r border-[var(--color-border)] bg-[var(--color-background-secondary)]"
      style={{ minHeight: 0, minWidth: 0 }}
      aria-label={t('sidebar.ariaLabel')}
    >
      {/* Header — clean, no collapse */}
      <div className="h-[var(--space-3)] shrink-0" />

      <>
        {/* Chat scroll area */}
        <div className="flex-1 overflow-y-auto px-[var(--space-4)] py-[var(--space-4)]">
          <ChatMessageList
            messages={chatMessages}
            loading={!chatLoaded}
            isGenerating={isGenerating}
            pendingToolCalls={pendingToolCalls}
            streamingText={
              streamingAssistantText && streamingAssistantText.designId === currentDesignId
                ? streamingAssistantText.text
                : null
            }
            empty={<EmptyState onPickStarter={handlePickStarter} />}
          />
        </div>

        {/* Skill chips + prompt input + model/tokens line */}
        <div className="border-t border-[var(--color-border-subtle)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-3)] space-y-[10px] bg-[var(--color-background-secondary)]">
          <CommentChipBar />
          <PromptInput
            ref={promptInputRef}
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={onSubmit}
            onCancel={cancelGeneration}
            isGenerating={isGenerating}
            onPaste={(event) => {
              void handlePromptPaste(event);
            }}
            contextSummary={
              contextItems.length > 0 ? (
                <div className="flex flex-wrap gap-[8px]">
                  {visibleFiles.map((file) => {
                    const isCanvasImport = canvasImportedFiles.some(
                      (candidate) => candidate.path === file.path,
                    );
                    return (
                      <AttachmentChip
                        key={file.path}
                        file={file}
                        isCanvasImport={isCanvasImport}
                        canvasLabel={t('canvas.canvasTab')}
                        removeLabel={t('sidebar.removeFile', { name: file.name })}
                        onRemove={() =>
                          isCanvasImport
                            ? removeCanvasImportedFile(file.path)
                            : removeInputFile(file.path)
                        }
                      />
                    );
                  })}
                  {hasCanvasContext ? (
                    <span
                      className="inline-flex max-w-full items-center gap-[6px] rounded-full border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-[10px] py-[5px] text-[11px] text-[var(--color-text-secondary)]"
                      title={
                        canvasWillBeSent ? t('canvas.contextReady') : t('canvas.contextUpToDate')
                      }
                    >
                      <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        {t('canvas.canvasTab')}
                      </span>
                      <span>
                        {canvasWillBeSent ? t('canvas.contextReady') : t('canvas.contextUpToDate')}
                      </span>
                    </span>
                  ) : null}
                  {referenceUrl.trim() ? (
                    <span
                      className="inline-flex max-w-full items-center gap-[6px] rounded-full border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-[10px] py-[5px] text-[11px] text-[var(--color-text-secondary)]"
                      title={referenceUrl.trim()}
                    >
                      <ContextIcon icon="url" />
                      <span className="truncate max-w-[220px]">{referenceUrl.trim()}</span>
                    </span>
                  ) : null}
                  {designSystem ? (
                    <span
                      className="inline-flex max-w-full items-center gap-[6px] rounded-full border border-[var(--color-border)] bg-[var(--color-background-secondary)] px-[10px] py-[5px] text-[11px] text-[var(--color-text-secondary)]"
                      title={designSystem.rootPath}
                    >
                      <ContextIcon icon="designSystem" />
                      <span className="truncate max-w-[220px]">{designSystem.summary}</span>
                      <button
                        type="button"
                        onClick={() => {
                          void clearDesignSystem();
                        }}
                        aria-label={t('sidebar.clear')}
                        className="inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <X className="w-3 h-3" aria-hidden />
                      </button>
                    </span>
                  ) : null}
                </div>
              ) : null
            }
            leadingAction={
              <AddMenu
                onAttachFiles={() => {
                  void pickInputFiles();
                }}
                onLinkDesignSystem={() => {
                  void pickDesignSystemDirectory();
                }}
                referenceUrl={referenceUrl}
                onReferenceUrlChange={setReferenceUrl}
                hasDesignSystem={Boolean(designSystem)}
                disabled={isGenerating}
              />
            }
          />
          <div className="flex items-center justify-between gap-[var(--space-2)] px-[2px]">
            <ModelSwitcher variant="sidebar" />
            {lastTokens !== null ? (
              <span
                className="shrink-0 tabular-nums text-[10.5px] text-[var(--color-text-muted)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t('sidebar.chat.tokensLine', { count: lastTokens })}
              </span>
            ) : null}
          </div>
        </div>
      </>
    </aside>
  );
}
