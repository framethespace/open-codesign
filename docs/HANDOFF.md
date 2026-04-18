# Handoff Notes — open-codesign

For the second contributor joining the project. Goal: pick up where main was left, ship the remaining v0.1 quality bar, then move to v0.2 features.

Last updated: 2026-04-18 by hqhq1025.

---

## 0. First 30 minutes

```bash
git clone git@github.com:OpenCoworkAI/open-codesign.git
cd open-codesign
pnpm install
pnpm --filter @open-codesign/desktop dev
```

Open Settings on the welcome screen, paste a real API key (Anthropic / OpenAI / OpenRouter), pick models, then try a starter prompt. If you see a generated HTML mockup in the right pane and can export it via the toolbar, you have a working baseline.

If you use a proxy / relay (中转站), expand **Advanced — custom base URL** under the API key field and paste the relay endpoint (must be a full URL including `/v1`).

---

## 1. Read first

Read these in order before changing anything substantial:

1. [`docs/CONSENSUS.md`](./docs/CONSENSUS.md) — single source of truth for decisions, current state, gotchas
2. [`CLAUDE.md`](./CLAUDE.md) — repo conventions
3. [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) — CI-enforced engineering rules (especially §5b)
4. [`docs/VISION.md`](./docs/VISION.md) — what the product is and isn't
5. [`docs/COLLABORATION.md`](./docs/COLLABORATION.md) — workflow (worktrees, PRs, squash-merge cadence)
6. [`docs/RESEARCH_QUEUE.md`](./docs/RESEARCH_QUEUE.md) — the 9 research reports under `docs/research/` and what each one decided

---

## 2. State of the union

**On `main` and working today:**
- Onboarding wizard (3 steps) with `safeStorage`-encrypted keychain
- Custom base URL (proxy / relay) input under "Advanced" in the paste-key step
- 4 starter demo prompts (`packages/templates/src/index.ts`)
- HTML generation via `@mariozechner/pi-ai` → streaming artifact parser → iframe preview
- HTML export via `dialog.showSaveDialog`
- Marketing site (VitePress) at `website/`
- Tokenized design system in `packages/ui/src/tokens.css` (Wordmark, EmptyMark, full text/leading/tracking/space/motion scales)

**Open PRs that need conflict resolution before they merge:**

| # | Branch | What it adds | Conflicts on |
|---|---|---|---|
| 2 | `wt/i18n` | `packages/i18n` (en + zh-CN), locale IPC, per-locale demo prompts, system-locale auto-detect | `App.tsx`, `store.ts`, `main/index.ts`, `preload/index.ts` |
| 3 | `wt/preview-ux` | Settings overlay (4 tabs), command palette (Cmd+K), Toast, Sidebar/PreviewPane/TopBar extraction, theme toggle | `App.tsx`, `store.ts` |
| 6 | `wt/reliability` | Error boundaries, AbortController cancellation, `completeWithRetry` with 429 handling, iframe error reporting | `App.tsx`, `store.ts`, `core/index.ts`, `providers/index.ts` |
| 7 | `wt/exporters` | Real PDF (puppeteer-core + system Chrome), real PPTX (pptxgenjs + CJK fix), real ZIP (zip-lib) | `package.json`, `PreviewToolbar.tsx` |

These branches are valuable but the App.tsx/store.ts conflicts are 4-way (we have onboarding + first-demo + UIUX iteration on main now). Resolution strategy options:

- **Option A** (recommended): cherry-pick the new files (those are conflict-free) and rewrite the App.tsx/store.ts integration by hand on top of current main.
- **Option B**: rebase each branch carefully and resolve the merge markers manually.
- **Option C**: close the PRs and reimplement the missing features as fresh small PRs against the current main.

I tried option B for #2 and hit four-way merges in store.ts. Option A is what I would do next.

---

## 3. Suggested next 5 things to ship (in order)

1. **Resolve the 4 open PRs** (or reimplement their features). Highest-value pieces, in priority order:
   - `wt/exporters` real PDF + ZIP (PPTX is tier 2 and can wait)
   - `wt/reliability` error boundaries + AbortController + retry
   - `wt/i18n` zh-CN end-to-end (most users will want this)
   - `wt/preview-ux` settings overlay + command palette + theme toggle
2. **Streaming generation** (Tier 2 of `packages/core`) — currently `core.generate()` blocks until the full response arrives. Switch to `streamArtifacts()` so tokens appear as they arrive and the UI can show ≤200 ms feedback. See `docs/research/05-pi-ai-boundary.md` and `docs/research/07-first-5-minutes.md`.
3. **Inline comment loop** — click an element in the preview, write a comment, AI rewrites that region. Mechanism is decided in `docs/research/02-inline-comment-and-sliders.md`. Estimated 3-5 days.
4. **AI-generated custom sliders** — model emits `design_params` JSON; frontend renders sliders bound to CSS variables; drag mutates CSS without re-running the model. Same research report.
5. **UIUX iteration v2** — push 7.5/10 → 9/10. Focus areas: chat history list, generation-in-progress states (skeleton, streaming token highlight), settings drawer. The first iteration is in commits `49985a9` ... `a11f416`.

---

## 4. Workflow expectations

- **Branch naming**: `feat/<slug>` for features, `fix/<slug>` for bugfixes, `wt/<slug>` for worktree-isolated agent work.
- **DCO sign-off** required (`git commit -s -m "..."`). CI's `DCO check` step blocks otherwise.
- **Conventional Commits** (commitlint enforces this).
- **Squash-merge** to main as soon as CI is green. Pre-alpha solo workflow does not require external review; switch back to PR review when we go public.
- **No new prod deps** without justification (size + license + alternatives) in the PR body.
- **Run before push**: `pnpm install && pnpm -r typecheck && pnpm lint && pnpm -r test`
- **All visible UI** uses `var(--color-*)` / `var(--text-*)` / `var(--space-*)` tokens. Never hardcode hex / px / fonts.

---

## 5. Things I would have done if I had another hour

- Properly resolve the 4 open PRs into main (the file boundaries are fine, the merge effort is real).
- Add `OPENAI_API_KEY` + `OPENAI_BASE_URL` repo secrets and set `vars.CODEX_BOT_ENABLED=true` so the Codex bot starts reviewing PRs.
- Wire the bundle-size CI gate (`size-limit` step in `.github/workflows/ci.yml`) before any release.
- Write integration tests for the onboarding flow (Playwright against the built app).
- Acquire a real exported HTML sample from Claude Design Pro and reverse-engineer it — the artifact schema in `packages/shared` is still tentative.

---

## 6. Things to be careful about

These have bitten me already:

- **Preload path** is `out/preload/index.mjs` (NOT `.js`). Electron 33+ supports it natively but the main process must reference `.mjs`. Already fixed in `46e8c8d`.
- **electron-vite + lockfile drift**: after a fresh `pnpm install`, you sometimes need `pnpm install` AGAIN if you switched between worktrees. The Re-optimizing dependencies message in the dev log is the signal.
- **Squash-merge can leave conflict markers** if a rebase was partially completed. Always grep for `<<<<<<<` after a squash-merge: `grep -rn "<<<<<<<" apps/ packages/`.
- **Tailwind v4 length tokens**: `text-[var(--text-xl)]` is silently treated as ambiguous. Use `text-[length:var(--text-xl)]` or register tokens via `@theme`.
- **Biome `useLiteralKeys` is OFF** because it conflicts with TS `noPropertyAccessFromIndexSignature`. Use bracket notation for env / record / config access (`process.env['FOO']`, not `process.env.FOO`).
- **pi-ai is single-maintainer** (`badlogic/pi-mono`, ~36k stars, bus-factor 1). Pin the version. Don't fork. Wrap missing features in `packages/providers`.
- **Electron 41.x is excluded** in `renovate.json` due to a cross-origin isolation regression. Don't bypass.

---

## 7. Pilot demo verification checklist

After any non-trivial change, walk this list to confirm nothing regressed:

- [ ] `pnpm install && pnpm -r typecheck && pnpm lint && pnpm -r test` all green
- [ ] `pnpm --filter @open-codesign/desktop dev` opens an Electron window without errors in `/tmp/codesign-dev.log`
- [ ] First launch shows the Welcome step of the onboarding wizard
- [ ] Pasting a real `sk-ant-...` key auto-detects Anthropic and validates within 500 ms
- [ ] Expanding "Advanced — custom base URL" and pasting a proxy URL also validates against the proxy
- [ ] After completing onboarding, the chat shell with 4 starter chips appears
- [ ] Clicking any chip + Send produces an HTML artifact in the right pane within ~30 s
- [ ] Click Export ▾ → HTML → save → opens correctly in the browser
- [ ] PDF / PPTX / ZIP show "Coming in Phase 2" until #7 lands
- [ ] Restart the app — onboarding is skipped and the chat shell loads with the saved provider

---

## 8. How to reach me

- GitHub @hqhq1025 — open an Issue, tag me on a PR, or comment on a Discussion
- For architecture / direction questions, open a GitHub Discussion first; don't change the locked decisions in `docs/VISION.md` without that

Happy hacking. Build the simplest thing that works, then iterate. Do not skip the research-first step — every locked decision in this repo has a report under `docs/research/` explaining why.
