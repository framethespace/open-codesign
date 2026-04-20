---
layout: home
title: Open CoDesign
titleTemplate: Open-Source AI Design Tool — BYOK, Local-First, Apache-2.0
description: Open CoDesign is an open-source desktop AI design tool. Bring your own API key (Anthropic, OpenAI, Gemini, Ollama). Everything runs locally. The open-source alternative to Anthropic Claude Design.

hero:
  name: Open CoDesign
  text: Design with intent.
  tagline: An open-source desktop app for designing with AI. Bring your own model. Keep everything local. The open-source alternative to Anthropic Claude Design.
  image:
    src: /og.svg
    alt: Open CoDesign — prompt to prototype
  actions:
    - theme: brand
      text: Download for macOS
      link: https://github.com/OpenCoworkAI/open-codesign/releases
    - theme: alt
      text: Star on GitHub
      link: https://github.com/OpenCoworkAI/open-codesign
    - theme: alt
      text: Quickstart (90 s)
      link: /quickstart

features:
  - icon: 🪶
    title: Bring your own model
    details: Anthropic, OpenAI, Gemini, DeepSeek, OpenRouter, SiliconFlow, local Ollama, or any OpenAI-compatible relay — including keyless (IP-allowlisted) proxies. Switch providers in Settings. We don't proxy, we don't charge per token.
  - icon: ⚡
    title: Import in one click
    details: Already using Claude Code or Codex? Open CoDesign reads your existing config — providers, models, API keys — and brings it all in with a single click.
  - icon: 🏡
    title: Your laptop is the cloud
    details: Designs, prompts, codebase scans — SQLite + encrypted TOML on disk. No mandatory account, no telemetry by default. 100% local.
  - icon: 🪄
    title: Twelve design skills, not magic
    details: Twelve built-in design skill modules ship out of the box — dashboards, landing pages, slide decks, pricing pages, chat UIs, data tables, calendars, glassmorphism, editorial typography and more. Drop a SKILL.md into any project to teach the model your own taste.
  - icon: 🎚️
    title: AI-tuned sliders
    details: The model emits the parameters worth tweaking — color, spacing, font — and you drag to refine. No round-tripping the LLM for every nudge.
  - icon: 🔀
    title: Instant design switching
    details: Hop between your last five designs with zero delay. Preview iframes stay alive in memory — no reparse, no white flash, no waiting for snapshots to reload.
  - icon: 📱
    title: Desktop, tablet, phone
    details: Preview any artifact in a true phone frame or tablet width, side-by-side with the full canvas. See the responsive story before you export.
  - icon: 💬
    title: Comment, don't retype
    details: Click any element in the preview to drop a pin. Leave a note. The model rewrites only that region — no more re-prompting the whole page to move a button.
  - icon: 🧬
    title: Codebase to design system
    details: Point at a local repo. We extract Tailwind tokens, CSS vars, and W3C design tokens — every subsequent generation respects them. Coming soon.
  - icon: 📐
    title: Versions, diffs, snapshots
    details: Every iteration is a snapshot. Diff two versions side-by-side. Roll back. Fork. The history Claude Design doesn't have. Coming soon.
  - icon: 💸
    title: Cost transparency
    details: Token estimate before each generation. Weekly spend in the toolbar. Set a budget, get warned, never get surprised. Coming soon.
  - icon: 🚢
    title: Five exports, real files
    details: HTML (inlined CSS), PDF (via your local Chrome), PPTX, ZIP, and Markdown — all generated on-device. No Canva detour.
---

<div class="codesign-section">

## How it works

<div class="codesign-steps">
  <div class="codesign-step">
    <span class="num">1</span>
    <h3>Bring your own key</h3>
    <p>Anthropic, OpenAI, Gemini, DeepSeek, OpenRouter, Ollama — anything <code>pi-ai</code> speaks. No vendor lock-in.</p>
  </div>
  <div class="codesign-step">
    <span class="num">2</span>
    <h3>Type a prompt</h3>
    <p>Pick one of <strong>fifteen built-in demos</strong> — landing page, dashboard, pitch slide, pricing page, mobile app, chat UI, calendar, blog article, receipt, portfolio, email, and more — or describe your own. The first design renders in seconds in a sandboxed iframe.</p>
  </div>
  <div class="codesign-step">
    <span class="num">3</span>
    <h3>Refine, export, hand off</h3>
    <p>Inline comments, AI sliders, snapshot timeline. Export to HTML, PDF, PPTX, ZIP, or Markdown — all on-device.</p>
  </div>
</div>

</div>

<div class="codesign-section">

## How it compares

<p class="lede">We are not faster than Claude Design. We are different — open, multi-model, and local-first. The open-source alternative for teams that can't afford subscription lock-in or cloud data exposure.</p>

<div class="codesign-comparison">

|                       | Open source    | Models             | Runs locally | Pricing             |
| --------------------- | :------------: | :----------------: | :----------: | :-----------------: |
| **Open CoDesign**     | **Apache-2.0** | **Any (BYOK)**     | **✓**        | **Token cost only** |
| Claude Design         | ✗ Closed       | Opus only          | ✗            | Subscription        |
| v0 by Vercel          | ✗ Closed       | Curated            | ✗            | Subscription        |
| Lovable               | ✗ Closed       | Curated            | ✗            | Subscription        |
| Bolt.new              | Partial        | Curated            | ✗            | Subscription        |

</div>

</div>

<div class="codesign-section">

## Trusted by builders

<div class="codesign-proof">
  <p class="proof-placeholder">⭐ <strong>Star us on GitHub</strong> — every star helps more builders find an open alternative.</p>
  <!-- Replace with real social proof: star count, user quotes, HN/PH mentions -->
</div>

</div>

<div class="codesign-cta">

### Ready to design without the lock-in?

<a href="/open-codesign/quickstart" class="cta-primary">Get started in 90 seconds →</a>
<a href="https://github.com/OpenCoworkAI/open-codesign" class="cta-secondary">View on GitHub</a>

</div>
