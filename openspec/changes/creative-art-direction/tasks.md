# Tasks: Creative Art Direction for Infographic Prompts

## 1. Style-Lock Positive Direction

- [x] 1.1 Update `src/lib/server/styleLockService.ts` so `STYLE_LOCK_SYSTEM_PROMPT` requests editorial composition language, texture/depth treatment, and visual rhythm.
- [x] 1.2 Keep all eight labelled style-lock lines: MEDIUM, PALETTE, TYPOGRAPHY, FOCAL POINT, SHAPE LANGUAGE, BACKGROUND, CONTRAST, CONSISTENCY.
- [x] 1.3 Keep aesthetic-only hard rules and `assertAestheticOnly` behaviour unchanged.
- [x] 1.4 Do not mandate one permanent layout, palette, or reference-image style.

## 2. Visual-Note Positive Direction

- [x] 2.1 Update `src/lib/server/promptGenerator.ts` so `VISUAL_NOTES_SYSTEM_PROMPT` requires a composition concept, focal hierarchy, and spatial relationship.
- [x] 2.2 Require at least one appropriate composition device when useful: split, diagonal, frame, divider, callout, arrow, badge, shadow, texture field, overlap, varied scale, depth, or spatial rhythm.
- [x] 2.3 Discourage default catalogue grids, uniform tiles, centred inventory, fixed `3x2`/`2x3`, or headline-at-top unless semantically required.
- [x] 2.4 Distinguish diagrammatic/compositional arrows from carousel navigation arrows; keep navigation/UI arrows prohibited.
- [x] 2.5 Keep `on_image_text` as only primary artwork text and preserve render/context boundaries.

## 3. Provider Exclusions

- [x] 3.1 Keep all existing exclusion categories in `EXCLUSIONS_RULE`.
- [x] 3.2 Clarify that diagrammatic/compositional arrows in visual direction are not the same as prohibited carousel/UI arrows.

## 4. Tests

- [x] 4.1 Test that `STYLE_LOCK_SYSTEM_PROMPT` requests editorial composition language, texture/depth, and visual rhythm.
- [x] 4.2 Test that style lock still contains all eight labelled lines and aesthetic-only restrictions.
- [x] 4.3 Test that `VISUAL_NOTES_SYSTEM_PROMPT` requests composition concept, spatial relationship, and composition devices.
- [x] 4.4 Test that visual-note instruction discourages default catalogue grids/fixed `3x2`/`2x3`/centred inventory while allowing semantically required grids.
- [x] 4.5 Test that arrow boundary distinguishes diagrammatic/compositional arrows from carousel navigation arrows.
- [x] 4.6 Test that all provider prompts preserve render/context headings, exact text, exclusions, verbatim style lock, canvas, and ratio.
- [x] 4.7 Test that no new facts, model IDs, provider guarantees, or seed parameters appear.

## 5. Verification and Review

- [x] 5.1 `bun run test` passes.
- [x] 5.2 `bun run check` passes.
- [x] 5.3 `bun run lint` passes.
- [x] 5.4 `openspec validate creative-art-direction` passes.
- [ ] 5.5 Owner review: generate one post, produce images in an external generator, and compare output against the latest flat catalogue result and earlier professional-looking references.

## Dependencies

```
1 (style-lock wording) -> 4 (tests)
2 (visual-note wording) -> 4
3 (exclusions wording) -> 4
4 (tests) -> 5 (verification)
```

No schema change, no migration, no new route, no new field, and no provider integration is required.
