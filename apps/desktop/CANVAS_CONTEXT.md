# Canvas Context

The desktop app now includes a pinned `Canvas` tab beside `Files`. It embeds a
full Excalidraw surface that can be used before the first generation, so users
can sketch wireframes, widgets, animation notes, and layout ideas before asking
the model to build or edit the UI.

## How It Works

- The renderer mounts Excalidraw in `CanvasSketchView.tsx`.
- Canvas state is stored per design through `canvas:v1:*` IPC handlers in
  `src/main/canvas-ipc.ts`.
- Scene JSON is persisted under the app user-data directory, alongside a small
  list of imported local files.
- Imported images are also surfaced as regular chat attachments so the model
  receives both the scene context and the original image files.

## Prompt Context Export

Before generation, the store converts the current scene into prompt attachments:

- `canvas-summary.md` with a compact summary of visible elements and labels
- one `canvas.png` and one `canvas.svg` export for the whole scene, or
- up to four frame-specific `canvas-frame-*.png` and `canvas-frame-*.svg` exports when Excalidraw frames are present

These artifacts are written to a temp directory and attached automatically when
the canvas contains visible content.

## Current Limitation

The current generation pipeline is still text-first. In practice that means the
model receives markdown plus exported scene assets, and imported source images
are forwarded as binary attachments rather than OCR-style text dumps. The app
can also attach a captured preview screenshot for review-oriented follow-up
prompts, but the canvas pipeline is still export-based rather than full
interactive scene understanding.

## Testing Note

Vitest uses a local Excalidraw shim so renderer tests stay deterministic and do
not depend on the full browser/runtime behavior of the published Excalidraw
bundle.
