# Proposal: Per-Post Style Lock for Slide Consistency

## Context

The prompt pipeline currently generates each slide independently. `promptGenerator.ts` calls `buildVisualNotes` once per slide, and each call produces its own `visual_notes` describing composition, colours, and style. Nothing carries an aesthetic decision from one slide to the next.

Observed result from a real generation (owner test, 5-slide Instagram feed square post about "Bata merah vs bata ringan"): the prompt requested `Flat illustration style, clean white background`, but the returned image was a photorealistic render with textured typography, and the model additionally drew five carousel dot indicators that no part of the prompt asked for.

Research into GPT Image prompting guidance was performed via You.com and is recorded in `docs/gpt-image-consistency-reference.md`, separating OpenAI documentation from third-party and community claims.

## Problem

1. **Style drifts between slides.** Because each slide's aesthetic is decided independently, slide 1 can be photorealistic while slide 2 is flat. The variation is accidental rather than chosen.
2. **Style instructions are weakly expressed.** A short label such as "flat illustration style" competes with a subject that is commonly photographed. OpenAI's prompting guide directs authors to state the visual medium directly and be concrete about shapes, materials, and textures.
3. **No exclusions are stated.** OpenAI's guidance recommends explicit exclusions, and its image-eval guidance treats unrequested components and extra text as failures. The current templates state none, which is consistent with the observed unrequested carousel dots.
4. **In-image text is not constrained as exact.** OpenAI's guide directs authors to place literal text in quotes and treat typography as a constraint. The current template supplies the text but does not mark it verbatim or forbid additional text.

## Solution

Introduce a **style lock**: one aesthetic specification per post, produced once, reviewable and editable by the owner, then copied verbatim into every slide prompt.

### Two layers, deliberately separated

- **Locked across all slides:** visual medium, colour palette, typography treatment, line and shape language, background treatment.
- **Free per slide:** subject, composition, focal point, visual metaphor, and on-image text.

This keeps a carousel recognisable as one set while allowing each slide a different layout. It does not reduce per-slide creativity; it moves the difference between slides from accident to decision.

### Generation and review

1. After research is approved, the system produces a style lock once from the post's topic, selected visual command, and approved research.
2. The style lock is shown to the owner, who may edit it or regenerate it before slides are generated.
3. The stored style lock text is inserted into every slide prompt without paraphrase.
4. Regenerating slides reuses the stored style lock unless the owner explicitly regenerates it.

### Prompt changes

- For the GPT Image variant, the selected visual command is emitted as the first token of the prompt, e.g. `/infographic Create an image for ...`, in addition to the existing `Visual form:` line. This is the owner's requested format. It is a prompt-writing convention from the owner's catalog, not a verified provider API command.
- Every variant carries the verbatim style lock.
- Every variant carries an exclusions block covering carousel dot indicators, page indicators, swipe arrows, app or browser interface, device frames, decorative borders and frames, watermarks, logos, signatures, QR codes, placeholder text, and any text beyond the specified on-image text.
- On-image text is marked as exact and verbatim, with no additional characters.

## Scope

### In Scope

- A `style_lock` column on `posts`, holding the reviewed style specification text.
- A style-lock generation step, with owner review and edit, gated after research approval.
- Verbatim insertion of the style lock into all three provider variants.
- Visual command as the leading token of the GPT Image variant.
- An exclusions block and exact-text instruction in all variants.
- A reference document recording which prompting guidance is official OpenAI documentation and which is third-party or community.

### Out of Scope

- Reference-image or image-input workflows. The application generates prompts only and does not send or store images.
- Any claim that a provider guarantees style consistency, exact pixel dimensions, or exact text rendering. OpenAI's own documentation states the model may struggle with visual consistency across generations and with precise text placement.
- Any use of a `seed` parameter. OpenAI's GPT Image documentation and cookbook do not document one, so no requirement may depend on it.
- A brand-wide style shared across all posts, and manual-only style authoring. Both were considered and not selected.
- Changes to the placement catalog, the visual command catalog, `slide_count`, or `post_status`.

## Success Criteria

- One style lock exists per post and is visible and editable before slides are generated.
- All slides of a post carry byte-identical style lock text.
- Every generated prompt contains the exclusions block and marks on-image text as exact.
- The GPT Image variant begins with the selected visual command token.
- Regenerating slides does not silently change the style lock.
- No engineering fact, number, material, dimension, or named method originates from the style lock; facts continue to come only from approved research and the owner topic.

## Risks

- **A style lock could smuggle in factual claims.** Mitigation: the generation instruction restricts the style lock to aesthetic properties, and the fact-fidelity boundary continues to apply to it.
- **An edited style lock could contradict the selected visual command.** Mitigation: the owner's edit is authoritative and is used as written; the system does not silently reconcile the two.
- **Exclusions cannot guarantee compliance.** OpenAI's guidance recommends exclusions but does not promise adherence. Mitigation: no requirement asserts that the provider will obey.
- **An extra LLM call per post adds cost and latency.** Mitigation: the style lock is generated once per post and reused, not regenerated per slide.
