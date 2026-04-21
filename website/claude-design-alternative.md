---
title: Claude Design Alternative — Open-Source, Self-Hosted, BYOK
description: Looking for a Claude Design alternative? Open CoDesign is the open-source Claude Design alternative — self-hosted, multi-model BYOK, local-first, Apache-2.0. Runs on macOS, Windows, Linux.
head:
  - - meta
    - property: og:title
      content: Claude Design Alternative — Open CoDesign (Open Source)
  - - meta
    - property: og:description
      content: Open CoDesign is the open-source Claude Design alternative. Self-hosted, BYOK, local-first. Any model — Anthropic, OpenAI, Gemini, DeepSeek, Ollama.
---

# The Open-Source Claude Design Alternative

**Open CoDesign** is the open-source Claude Design alternative. A self-hosted desktop AI design tool that turns prompts into HTML prototypes, React components, slide decks, PDFs, and marketing assets — on your laptop, with any model you already pay for. Apache-2.0 licensed.

[Download for macOS / Windows / Linux →](https://github.com/OpenCoworkAI/open-codesign/releases) · [Quickstart (90 s)](./quickstart) · [Star on GitHub](https://github.com/OpenCoworkAI/open-codesign)

## Why a Claude Design alternative?

Anthropic's Claude Design is a great web app — but it forces three things that don't work for every team:

1. **Subscription lock-in.** Rate-limited at $200/month; no way to control cost on rough drafts.
2. **Single-model ceiling.** Claude Opus only. No GPT, no Gemini, no local model.
3. **Cloud processing.** Every prompt, every design goes to Anthropic's servers. No meaningful export, no version history, no codebase awareness.

Open CoDesign is the open-source Claude Design alternative for teams that need BYOK cost control, multi-model flexibility, or on-device privacy.

## Open CoDesign vs Claude Design

|                       | Open CoDesign (open-source) | Claude Design |
| --------------------- | :-------------------------: | :-----------: |
| License               | **Apache-2.0**              | Closed        |
| Runs on               | **Your laptop (macOS / Windows / Linux)** | Cloud (browser) |
| Models                | **Any — Anthropic, OpenAI, Gemini, DeepSeek, OpenRouter, SiliconFlow, Ollama, OpenAI-compatible** | Anthropic Opus only |
| Keyless proxy support | **Yes (IP-allowlisted)**    | No            |
| Config import         | **Claude Code + Codex, one click** | No    |
| Built-in design skills | **12 modules (slide decks, dashboards, landing pages, …)** | None |
| Demo prompts          | **15 ready-to-edit**        | Blank canvas  |
| Data location         | **SQLite on your machine**  | Anthropic servers |
| Version history       | **Local snapshots**         | None          |
| Export                | **HTML, PDF, PPTX, ZIP, Markdown** | HTML       |
| Inline element comments | **Yes (AI rewrites only the pinned region)** | No |
| AI-tunable sliders    | **Yes**                     | No            |
| Responsive frames     | **Phone / tablet / desktop** | Limited      |
| Price                 | **Free (BYOK token cost)**  | Subscription  |

## What you get

- **Bring any API key** — Anthropic Claude, OpenAI GPT, Google Gemini, DeepSeek, OpenRouter, SiliconFlow, local Ollama, or any OpenAI-compatible endpoint.
- **Import your existing Claude Code or Codex config** in one click — providers, models, keys, all at once.
- **Twelve built-in design skill modules** — slide decks, dashboards, landing pages, SVG charts, glassmorphism, editorial typography, heroes, pricing, footers, chat UIs, data tables, calendars.
- **Fifteen demo prompts** in English and 简体中文 — landing page, dashboard, pitch slide, pricing page, mobile app, chat UI, event calendar, receipt/invoice, portfolio, settings panel, and more.
- **Inline comment → AI patch loop** — click any element in the preview, leave a note, the model rewrites only that region.
- **AI-generated tunable sliders** — the model exposes the parameters worth tuning (color, spacing, font); drag to refine without re-prompting.
- **Phone / tablet / desktop responsive frames** — true responsive preview, switch with one click.
- **Five export formats** — HTML (inlined CSS), PDF (via your local Chrome), PPTX, ZIP, Markdown. All on-device.
- **Four-tab Settings** — Models, Appearance (light/dark, EN/ZH), Storage, Advanced.
- **Local-first, zero telemetry by default.** SQLite for designs, encrypted TOML via Electron `safeStorage` for keys.

## Is this a fork of Claude Design?

No. Open CoDesign is an independent, clean-room open-source project inspired by what Claude Design proves is possible. We don't use any Anthropic proprietary code. The name "Claude Design" belongs to Anthropic; we are the open-source alternative, not an affiliate.

## Install

- [Download pre-built installer](https://github.com/OpenCoworkAI/open-codesign/releases) — macOS DMG, Windows EXE, Linux AppImage
- [90-second Quickstart](./quickstart) — first design from prompt to export
- [Build from source](./quickstart#build-from-source) — Node 22 LTS + pnpm 9.15+

## Questions

- **Is it really free?** Yes. You pay only the token cost to whichever model provider you bring.
- **Does it send anything to the cloud?** Only the prompts you send to your own model provider. Nothing goes to OpenCoworkAI or a shared backend.
- **Can I use it with Ollama?** Yes. Any OpenAI-compatible endpoint works, keyless proxies included.
- **Can I self-host?** It's a desktop app — it already runs entirely on your machine.
- **What license?** Apache-2.0. Fork it, ship it, sell it. Keep the NOTICE.

Ready to try the open-source Claude Design alternative? [Download Open CoDesign →](https://github.com/OpenCoworkAI/open-codesign/releases)
