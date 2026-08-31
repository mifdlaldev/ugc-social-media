# Proposal: Human Voice and Visual Impact for Educational Carousels

## Context

The current implementation adds structured teaching fields, but the owner tested the output and found two problems:

1. `slide_explanation` is passed into the provider prompt without clearly saying whether it should be rendered. Image models consequently render the full explanation as a large paragraph, making the image look like a document rather than an infographic.
2. The generated style lock can select a muted palette and low-impact typography. The owner preferred an earlier sample with strong deep-slate/orange contrast, a clear focal point, and bold display type.
3. Generated copy still sounds like a template: `Sumber menjelaskan bahwa`, `Anda akan mempelajari`, repeated question titles, repeated `bukan sekadar X` constructions, and formal calls to action. The owner wants the voice of a human civil-engineering creator explaining a practical point to students.

Owner requirements are recorded in `docs/owner-content-direction.md`. Educational-copy and human-voice research is recorded in `docs/educational-carousel-copy-reference.md` and the underlying research notes. The research distinguishes peer-reviewed findings, style guidance, and marketing opinion. It does not support optimizing copy to evade AI detectors.

## Problem

- The prompt does not distinguish **artwork text** (`on_image_text`) from **teaching context** (`slide_explanation`, `slide_subtitle`, `slide_takeaway`, and research context).
- Style lock consistency exists, but visual impact is not constrained enough to prevent a soft, generic result.
- The copy prompt encourages polished but generic language and does not constrain attribution formulae, repetitive structures, or register.
- A human-sounding voice can be misimplemented as invented personal experience, slang everywhere, or detector evasion. Those are unacceptable for technical education.

## Solution

### 1. Explicit render boundary

Every provider prompt SHALL carry two visibly separate sections:

- `RENDER IN ARTWORK`: only the exact `on_image_text` and any explicitly requested visual labels/progress marker.
- `CONTEXT FOR IMAGE COMPOSITION ONLY — DO NOT RENDER AS BODY COPY`: subtitle, explanation, takeaway, and research context.

The provider must be told that the explanation informs the visual concept but must not appear as a full paragraph in the artwork. If a short explanatory phrase is intentionally needed in the image, it must be placed in `on_image_text` and marked exact.

### 2. High-impact but controlled style

Style lock generation SHALL include a visual-impact brief that remains aesthetic-only:

- one high-contrast accent against a dark or light base;
- a clear dominant focal point;
- bold display typography with readable scale hierarchy;
- deliberate compositional tension or contrast appropriate to the selected visual command;
- generous safe space so text is not crowded;
- no random palette expansion, decorative clutter, or unrequested UI elements.

This does not force one permanent orange/navy brand style. It preserves per-post variation while requiring the result to have a deliberate visual entry point and readable hierarchy. The selected visual command still controls the visual form.

### 3. Human practitioner voice

Copy generation SHALL use a relaxed, clear Indonesian creator voice appropriate for civil engineering, construction, and architecture education:

- start from a practical question or situation the learner recognizes;
- explain the principle in plain language while keeping technical precision;
- use `kamu` for friendly educational social copy unless an approved platform voice says otherwise;
- vary sentence rhythm naturally, without mechanical randomness;
- use concrete evidence from the research packet;
- define jargon when first introduced;
- use first-person experience only when supplied by the owner; otherwise use an observed case, documented example, or clearly labelled hypothetical.

The prompt SHALL discourage formulaic attribution (`Sumber menjelaskan bahwa`, `studi menunjukkan`, `para ahli sepakat`) unless followed by a named, supplied source and a specific claim. It SHALL discourage repeated three-item staccato lists, repeated question-shaped headings, the `bukan sekadar X, tetapi Y` pattern, excessive em dashes, and translated-English Indonesian phrasing.

These are writing-quality constraints, not detector-evasion rules. Detector scores are not product metrics.

## Scope

### In Scope

- Provider prompt render-boundary instructions for all three providers.
- Style-lock generation requirements for contrast, focal hierarchy, typography impact, and controlled variation.
- Human-voice instructions for synthesis and visual-note generation.
- A deterministic sanitizer/validator for render-boundary placement where appropriate.
- Tests proving explanation is context-only and `on_image_text` is the only primary artwork copy.
- Tests for style-lock impact requirements and voice constraint presence.
- Documentation of the verified owner direction and evidence limits.

### Out of Scope

- Adding a new field to the database. Existing teaching fields and style lock are sufficient.
- Changing the selected visual command catalog or platform placement catalog.
- Changing slide count, slide 2 standalone behavior, CTA sequencing, or progress text; those belong to `carousel-narrative-structure`.
- Inventing a personal biography, jobsite anecdote, measurement, project, source, or opinion for the owner.
- Any prompt or code intended to bypass AI-text detection.
- A guarantee that an image provider will obey render boundaries, style instructions, exclusions, or text instructions.

## Success Criteria

- Generated prompts unambiguously state that explanations are composition context and must not be rendered as body paragraphs.
- Primary artwork text is limited to the explicit exact-text field and explicitly approved labels.
- Style locks show a deliberate focal point, contrast hierarchy, and display typography without adding engineering facts.
- Copy sounds like a clear technical creator, not a report template, while retaining source fidelity.
- No unsupported experience or claim is introduced to make the voice sound human.
- Existing style lock, canvas, command-prefix, exact-text, exclusion, and fact-fidelity behavior remains intact.

## Risks

- The provider may still render context despite the exclusion. Mitigation: explicit labelled sections, short artwork text, and owner review.
- Strong contrast can become visually aggressive. Mitigation: require one controlled accent and a clear hierarchy, not arbitrary saturation or clutter.
- Banning phrases too literally can produce unnatural copy. Mitigation: describe them as patterns to avoid, not a universal word blacklist.
- Natural voice variation can accidentally change technical meaning. Mitigation: keep research-grounding and qualifier-preservation rules higher priority than style.
