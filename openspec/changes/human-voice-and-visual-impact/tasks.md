# Tasks: Human Voice and Visual Impact

## 1. Render Boundary in Provider Prompts

- [x] 1.1 Restructure the three provider templates so each prompt contains a `RENDER IN ARTWORK — EXACT TEXT ONLY` section holding the exact `on_image_text` and, when present, the visual labels to render.
- [x] 1.2 Add a `CONTEXT FOR COMPOSITION ONLY — DO NOT RENDER AS BODY COPY` section holding slide title, subtitle, explanation, takeaway, and research context.
- [x] 1.3 Move `slide_title` into the context section so the artwork text is unambiguous.
- [x] 1.4 Add a no-body-copy entry to the exclusions block covering paragraphs of rendered explanation and rendering of the context section.
- [x] 1.5 Confirm the GPT Image variant still begins with the selected visual command token and that the style lock, canvas, exact-text rule, and existing exclusions are unchanged.

## 2. Style Lock Impact Brief

- [x] 2.1 Extend the style-lock system prompt to require one dominant focal element per slide.
- [x] 2.2 Require exactly one high-contrast accent named against the base palette, and forbid palette expansion.
- [x] 2.3 Require a bold display treatment for headings with a stated scale hierarchy.
- [x] 2.4 Require generous safe space and forbid decorative clutter and interface ornament.
- [x] 2.5 Verify the existing aesthetic-only guard still rejects units, standards, prices, and durations after the wording change.

## 3. Voice Instructions

- [x] 3.1 Add the practitioner-voice block to the synthesis instruction, including the `kamu` default for educational social copy.
- [x] 3.2 Require opening from a recognisable situation or question rather than a report phrase.
- [x] 3.3 Require natural Indonesian connectors and forbid defaulting to `selain itu` or `dengan demikian` for every transition.
- [x] 3.4 Forbid literal translated-English phrasing.
- [x] 3.5 Name the discouraged patterns: formulaic attribution without a named supplied source, repeated three-item staccato lists, all-question headings, repeated `bukan sekadar X` constructions, and excessive em dashes.
- [x] 3.6 Add the no-invented-experience rule, allowing first-person only when the owner supplied it.
- [x] 3.7 State that fact fidelity outranks voice, so qualifier preservation and omission of unsupported claims stay higher priority.
- [x] 3.8 Keep `on_image_text` short enough to render legibly and consistent with the teaching copy, without copying the whole explanation.

## 4. Verification

- [x] 4.1 Test that every provider prompt contains both labelled sections.
- [x] 4.2 Test that the explanation appears only inside the context section.
- [x] 4.3 Test that the exclusions block contains the no-body-copy entry.
- [x] 4.4 Test that `on_image_text` is the only quoted primary artwork text.
- [x] 4.5 Test that the style-lock instruction contains the focal-point, accent, and display-typography requirements.
- [x] 4.6 Test that the synthesis instruction contains the voice rules, discouraged-pattern list, and no-invented-experience rule.
- [x] 4.7 Test that existing guarantees still hold: leading command token, verbatim style lock, canvas and ratio, exact-text rule, exclusions, aesthetic-only guard.
- [x] 4.8 Assert no source file contains a detector-evasion instruction.
- [x] 4.9 `bun run check`, `bun test --run`, and `bun run lint` pass.
- [x] 4.10 `openspec validate human-voice-and-visual-impact` passes.
- [x] 4.11 Run the pipeline smoke test and inspect one generated prompt for the render boundary.
- [ ] 4.12 Owner review: generate one post, produce the images, and confirm the artwork is not a document and the copy does not read as a template.

## Dependencies

```
1 (render boundary) -> 4 (verification)
2 (style impact)    -> 4
3 (voice)           -> 4
```

Independent of `carousel-narrative-structure`. No database change, so no migration is required.
