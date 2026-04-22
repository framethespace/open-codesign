---
schemaVersion: 1
name: frontend-design-uncodixfy
description: Push interface work away from obvious AI-generated visual clichés and toward more grounded, conventional product design when the output is starting to look generic or over-styled.
trigger:
  providers: ["*"]
  scope: system
disable_model_invocation: false
user_invocable: true
---

Use this skill when a UI starts to feel like "generic AI product design" instead of a product someone would ship.

Bias toward restraint:
- Prefer one clear visual idea over a pile of effects.
- Use real layout hierarchy before decorative chrome.
- Let spacing, alignment, and typography carry quality.

Actively avoid these fallback patterns unless the brief truly calls for them:
- Floating cards everywhere with too much empty padding.
- Oversized radii on every surface.
- Heavy gradients as a substitute for hierarchy.
- Random glass panels, glow, or blur for "premium" feeling.
- Decorative eyebrow pills and tiny labels above every heading.
- Symmetric, repetitive section stacks that all feel interchangeable.

Practical corrections:
- Anchor important surfaces to edges, grids, rails, or containers so the layout feels placed, not drifting.
- Reduce corner radii before adding more shadows.
- Use fewer background treatments and make the remaining ones intentional.
- Vary section density and composition so the page has rhythm.
- Prefer believable product details over ornamental flourish.

If the design is already clean, do not overcorrect. Keep the original intent and only remove the parts that make it look templated or AI-ish.
