# Tasks: Calibrate Visual Constraints for Image Prompts

## 1. Style-Lock Instruction Wording

- [x] 1.1 Update `src/lib/server/styleLockService.ts` so the style-lock prompt permits subtle grid, ruled texture, or constructive background texture when compatible with the selected visual form and text legibility.
- [x] 1.2 Replace any fixed empty-space proportion or fixed empty-space position requirement with readable safe space appropriate to each slide.
- [x] 1.3 State that focal position and composition can vary per slide; the style lock controls visual language, not one permanent layout.
- [x] 1.4 Keep all eight labelled style-lock lines: MEDIUM, PALETTE, TYPOGRAPHY, FOCAL POINT, SHAPE LANGUAGE, BACKGROUND, CONTRAST, CONSISTENCY.
- [x] 1.5 Keep one dominant focal element, one high-contrast accent, bold display typography, readable safe space, and no decorative clutter/interface elements/frames requirements.
- [x] 1.6 Do not introduce a fixed brand palette, a mandatory grid, or any permanent medium/style.

## 2. Shared Exclusions Wording

- [x] 2.1 Replace the long single-sentence `EXCLUSIONS_RULE` in `src/lib/server/promptGenerator.ts` with grouped sentences.
- [x] 2.2 Preserve every current exclusion category: UI elements, device frames, decorative borders/frames, watermarks, logos, signatures, QR codes, placeholder text, additional text, body-copy paragraphs, and composition-context rendering.
- [x] 2.3 Keep the render boundary and exact-text rule wording unchanged.

## 3. Invariants Verification

- [x] 3.1 Confirm all three provider prompts still include render/context headings, exact-text rule, exclusions, verbatim style lock, target canvas, and aspect ratio.
- [x] 3.2 Confirm `assertAestheticOnly` still rejects units, standards, prices, percentages, and durations.
- [x] 3.3 Confirm the GPT Image prompt still begins with the selected visual command token.
- [x] 3.4 Confirm no source introduces a provider guarantee, invented fact, model ID, or seed parameter.

## 4. Tests

- [x] 4.1 Test that the style-lock prompt contains all eight labelled lines.
- [x] 4.2 Test that the style-lock prompt still requires one focal point, one high-contrast accent, bold display typography, and readable safe space.
- [x] 4.3 Test that the style-lock prompt permits subtle grid/ruled/constructive texture.
- [x] 4.4 Test that the style-lock prompt no longer contains the blanket `no background patterns that fight the text` wording.
- [x] 4.5 Test that the style-lock prompt does not require fixed empty-space proportions or a fixed focal position across slides.
- [x] 4.6 Test that `EXCLUSIONS_RULE` retains every current exclusion category in grouped sentences.
- [x] 4.7 Test that all three provider prompts retain render/context headings, exact-text rule, exclusions, style lock, canvas, and ratio.
- [x] 4.8 Test that `assertAestheticOnly` still rejects units, standards, prices, percentages, and durations.

## 5. Verification and Review

- [x] 5.1 `bun run test` passes (Vitest, 167/167). Note: raw `bun test` uses Bun's runner and skips the Vitest `jsdom`/multi-project config, so the repo command is `bun run test`.
- [x] 5.2 `bun run check` passes.
- [x] 5.3 `bun run lint` passes.
- [x] 5.4 `openspec validate visual-style-calibration` passes.
- [ ] 5.5 Owner review: generate one post, produce images in an external generator, and compare output against the observed flat/empty failure mode.

## Dependencies

```
1 (style-lock wording) -> 4 (tests)
2 (exclusions wording) -> 4
3 (invariants)          -> 4
4 (tests)               -> 5 (verification)
```

No schema change, no migration, no new route, no new field, and no provider integration is required.
