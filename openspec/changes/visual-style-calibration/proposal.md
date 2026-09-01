# Proposal: Calibrate Visual Constraints for Image Prompts

## Context

Owner testing showed different visual results across prompt batches. The strongest observed batch used a bright signal-orange accent, a technical/isometric treatment, and subtle grid ruling. Weaker observed batches used muted palettes or instructions that produced a flat cream background, no pattern, and a single centered block.

The current implementation carries a style lock into every provider prompt. Its style-lock instruction requires one focal point, one high-contrast accent, bold display typography, generous safe space, and no background patterns that fight the text. The shared exclusions instruction also lists many unrequested elements in one long sentence. These are prompt directions, not provider guarantees.

Evidence basis:

- owner observations recorded in `docs/owner-content-direction.md`;
- provider-prompt rules in `src/lib/server/promptGenerator.ts`;
- style-lock rules in `src/lib/server/styleLockService.ts`;
- prompting findings recorded in `docs/gpt-image-consistency-reference.md`;
- prompt evolution and test batches inspected in git history, including `892e910` and `a5f526a`.

The evidence does not establish that one wording always produces one image result. Image generation remains stochastic. This change targets avoidable over-constraint only.

## Problem

- A blanket prohibition on background patterns can suppress constructive visual texture, including the subtle grid ruling observed in the stronger technical batch.
- Safe-space and focal-point instructions can be interpreted as a fixed, sparse composition instead of a readable hierarchy with supporting visual structure.
- The exclusions sentence repeats many negative constraints and can compete with positive medium, composition, palette, and typography direction.
- Existing exact-text and fact-fidelity boundaries must remain intact while visual constraints are relaxed.

## Solution

Calibrate style-lock and provider-prompt instructions so positive visual direction remains primary and negative constraints prevent only documented failure modes:

- permit subtle grid, texture, or other background treatment when it supports the selected visual form and preserves text legibility;
- require readable safe space without prescribing a fixed empty-space proportion or a fixed focal position across slides;
- keep one dominant focal element and one high-contrast accent, while allowing per-slide composition to vary;
- shorten and group shared exclusions without removing protections against unrequested UI elements, branding, frames, extra text, body copy, or composition-context text;
- keep exact `on_image_text`, Indonesian rendering, style-lock verbatim reuse, visual command, canvas, aspect ratio, and fact-fidelity rules unchanged.

## Scope

### In Scope

- Style-lock generation wording for constructive background treatment, safe-space flexibility, and per-slide compositional variation.
- Shared provider exclusion wording, while preserving existing exclusion categories.
- Tests for relaxed visual constraints and preserved render/fact boundaries.
- One owner review smoke test using an external image generator after implementation.

### Out of Scope

- Image generation inside this application.
- Any provider API change, model change, seed parameter, reference-image workflow, or provider guarantee.
- New database columns, migrations, routes, UI fields, presets, visual commands, or platform placements.
- A mandatory brand palette such as orange/navy.
- Changes to article synthesis, research collection, slide count, CTA sequencing, or human voice rules.
- Removal of exact-text, no-body-copy, no-context-rendering, or fact-fidelity protections.
- Adding engineering facts, numbers, materials, dimensions, standards, citations, or claims.

## Success Criteria

- Generated style-lock instructions allow supporting grid or texture when compatible with the selected visual form and legibility.
- Generated style-lock instructions do not require a fixed empty-space proportion or fixed focal position across all slides.
- One focal element, one high-contrast accent, and readable display typography remain required.
- Provider prompts retain exact artwork-text and context boundaries, essential exclusions, verbatim style lock, command prefix, canvas, and aspect ratio.
- Shared exclusions are shorter or more clearly grouped without dropping documented protection categories.
- Tests prove relaxed visual wording does not weaken aesthetic-only validation or fact fidelity.
- Owner review can compare generated output against prior flat/empty failure mode, without treating one image as proof of provider determinism.

## Risks

- Relaxed background wording may reintroduce clutter. Mitigation: retain legibility, safe-space, one-focal-point, no-UI, no-frame, and no-extra-text constraints.
- Different image runs may still vary because external generation is stochastic. Mitigation: record this as a limitation; do not assert guaranteed quality or consistency.
- Shorter exclusions may omit a failure category. Mitigation: test every existing category before implementation is considered complete.
- Strong visual direction could become a hidden brand preset. Mitigation: keep palette and medium post-specific and selected by the style lock; do not mandate specific colours.
