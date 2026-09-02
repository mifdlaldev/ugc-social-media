# Proposal: Creative Art Direction for Infographic Prompts

## Context

Owner's latest test for `jenis jenis genteng` still produced a technically clean but boring hook. The supplied prompt asked for six tiles in a `3x2` arrangement filling the centre, a headline at the top, a flat bone canvas, a faint grid, and one accent on one element. The result followed that literal catalogue layout: six objects, labels, plain background, and little visual invention.

The owner compared it with earlier successful images from 2026-08-30. Those references used stronger art direction: large colour fields, diagonal division, visual metaphor, expressive arrows/lines, varied scale, texture, shadows, and a clear editorial poster composition. Those images are references for visual delivery only, not sources of engineering facts.

The previous `visual-style-calibration` change removed one blanket texture prohibition and made focal position more flexible. It did not change the per-slide visual-note contract or require positive creative composition. The current `visual_notes` can still select literal arrangements such as `six genteng tiles fanned in 3x2 arrangement filling center`.

## Problem

- Per-slide visual notes can prescribe inventory and placement without prescribing a visual concept or editorial composition.
- The style lock still favours a flat canvas and minimal single-accent treatment, so positive creative direction remains weak.
- Exclusions prevent UI-like dots and arrows, but do not distinguish those from arrows, dividers, frames, shadows, and shapes used as legitimate diagram/decorative composition.
- A style prompt that names objects and labels but lacks composition devices produces junior-looking catalogue sheets rather than designed infographic posters.

## Solution

Add explicit positive art-direction requirements to style-lock and visual-note generation:

- require one deliberate editorial composition or visual concept per slide, such as comparison split, diagonal tension, exploded arrangement, cutaway, framed vignette, layered stack, process path, or another concept appropriate to the selected visual form;
- require varied scale, depth, overlap, direction, shape, or spatial rhythm when those choices suit the visual form;
- allow decorative and diagrammatic composition devices such as bold dividers, arrows, callout lines, frames, badges, shadows, texture fields, and geometric accents;
- permit arrows only when they communicate a diagram/process relationship or act as a deliberate non-UI composition device;
- keep carousel dots, page indicators, swipe arrows, app/browser chrome, device frames, and other interface cues prohibited;
- prevent visual notes from defaulting to inventory grids, fixed `3x2`/`2x3` arrangements, centred catalogues, or headline-at-top layouts unless the selected command and slide meaning require them;
- keep all text, labels, and factual content bounded by existing render and fact-fidelity rules.

## Scope

### In Scope

- Positive art-direction wording in `STYLE_LOCK_SYSTEM_PROMPT`.
- Positive composition requirements in `VISUAL_NOTES_SYSTEM_PROMPT`.
- Clarification of diagram/decorative arrows versus prohibited carousel/UI arrows in provider exclusions.
- Tests proving creative direction is required while text and factual boundaries remain intact.

### Out of Scope

- Image generation inside this app.
- Provider API changes, model changes, seed parameters, reference-image workflows, or provider guarantees.
- New database columns, routes, UI controls, presets, visual commands, or platform placements.
- Mandatory orange/navy branding or copying any one reference image as a permanent template.
- Adding, rewriting, or inferring engineering facts, numbers, material properties, dimensions, standards, citations, or claims.
- Allowing carousel dots, page indicators, swipe arrows, or app/browser UI elements.
- Changing article synthesis, research collection, slide count, CTA sequence, or human voice rules.

## Success Criteria

- Style-lock generation asks for a deliberate editorial composition/visual concept, not only object inventory.
- Visual-note generation asks for composition devices and discourages literal catalogue grids unless semantically required.
- Prompts allow creative dividers, arrows, frames, badges, shadows, texture, overlap, and varied scale when appropriate.
- Prompts distinguish diagram/decorative arrows from carousel navigation arrows; prohibited UI indicators remain prohibited.
- Existing exact-text, render-boundary, style-lock, canvas, ratio, visual-command, and fact-fidelity rules remain unchanged.
- Targeted tests pass and no unsupported facts are introduced.
- Owner review can compare a new generated hook with the latest flat catalogue result and earlier professional-looking references; no deterministic quality guarantee is claimed.

## Risks

- Creative freedom may create clutter or weaken legibility. Mitigation: retain one hierarchy, safe space, exact-text boundary, and legibility requirements.
- The model may interpret decorative arrows as navigation. Mitigation: explicitly identify allowed arrows as diagrammatic or compositional and keep UI arrows prohibited.
- Positive examples may become repetitive templates. Mitigation: require concept selection to follow slide meaning and selected visual command, not one permanent layout.
- Creative composition might imply facts not supplied. Mitigation: visual direction may rearrange or stylize supplied subjects only; factual labels and claims remain input-bound.
