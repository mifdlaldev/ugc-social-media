# Tasks: Explanatory Slide Copy

## 1. Reference

- [x] 1.1 Record owner content direction in `docs/owner-content-direction.md`.
- [x] 1.2 Record educational-copy research in `docs/educational-carousel-copy-reference.md`, labelled by source class.
- [x] 1.3 Verify the sample's `95%` figure against stored research and correct the earlier misreading in that note.
- [ ] 1.4 Re-check every requirement in this change against those two documents and drop anything they do not support.

## 2. Schema

- [ ] 2.1 Add nullable `slide_subtitle`, `slide_explanation`, `visual_labels`, and `slide_takeaway` to `prompt_slides` in `drizzle/schema.ts`.
- [ ] 2.2 Write a new migration using `ALTER TABLE prompt_slides ADD COLUMN` for each column; no rebuild is needed because none carries a CHECK constraint.
- [ ] 2.3 Apply the migration and verify existing slide rows remain readable with the new columns null.

## 3. Synthesis

- [ ] 3.1 Extend the synthesis JSON schema to return the teaching fields per slide.
- [ ] 3.2 Require every factual statement to come only from the supplied research and topic.
- [ ] 3.3 Require a source qualifier to be preserved exactly, so "hampir 95%" cannot become "95%".
- [ ] 3.4 Require a source's condition or scope to travel with its figure.
- [ ] 3.5 Require an unsupported claim to be omitted rather than completed from model memory.
- [ ] 3.6 Require a technical term to be introduced before the slide whose mechanism depends on it.
- [ ] 3.7 Require one teaching point per slide.
- [ ] 3.8 Forbid unsupported fear language, superlatives, and absolutes in the hook and elsewhere.
- [ ] 3.9 Require one direction language per generation while keeping on-image text Indonesian.
- [ ] 3.10 Validate required fields defensively and fail with named errors instead of returning empty copy.

## 4. Prompt Pipeline

- [ ] 4.1 Pass the teaching fields from synthesis into `SlideContext`.
- [ ] 4.2 Emit `Slide title`, optional `Slide subtitle`, `Slide explanation`, `Visual labels`, and `Slide takeaway` as separate labelled lines in all three provider templates.
- [ ] 4.3 Request labels near the components they identify, expressed as direction rather than a compliance guarantee.
- [ ] 4.4 Confirm the leading command token, verbatim style lock, target canvas, exact-text rule, and exclusions block are unchanged.
- [ ] 4.5 Remove the "not a full sentence" constraint from the per-slide text instruction without turning rendered text into a paragraph.

## 5. Persistence

- [ ] 5.1 Store the teaching fields when inserting `prompt_slides` rows in the API generate route.
- [ ] 5.2 Store them in the SvelteKit generate action as well, so both paths agree.

## 6. Owner UI

- [ ] 6.1 Show headline and subtitle near the slide-type badge on the generate page.
- [ ] 6.2 Show the explanation as body text.
- [ ] 6.3 Show labels and takeaway as compact secondary blocks.
- [ ] 6.4 Keep the copy action copying the provider prompt text, and keep third-party benchmark figures out of UI copy.

## 7. Verification

- [ ] 7.1 Test that the synthesis parser accepts the extended shape and rejects missing required fields.
- [ ] 7.2 Test qualifier preservation with a fixture snippet containing "hampir 95%".
- [ ] 7.3 Test that a claim absent from fixture research appears in no teaching field.
- [ ] 7.4 Test that all three provider templates emit the labelled teaching lines.
- [ ] 7.5 Test that existing guarantees still hold: leading token, verbatim style lock, exact-text rule, exclusions, canvas, ratio.
- [ ] 7.6 `bun run check`, `bun test --run`, and `bun run lint` pass.
- [ ] 7.7 `openspec validate educational-carousel-copy` passes.
- [ ] 7.8 Run the pipeline smoke test and confirm every slide carries a headline and an explanation.
- [ ] 7.9 Manual review: generate one post and confirm the copy reads as teaching rather than alarm.

## Dependencies

```
1 (reference) -> 3 (synthesis)
2 (schema) -> 5 (persistence) -> 6 (UI)
3 -> 4 (pipeline) -> 5
all -> 7 (verification)
```

Independent of `carousel-narrative-structure`, which owns slide count, progress text, standalone slide 2, and soft CTA placement. Both may be implemented in either order; if that change lands first, its rebuild must carry these columns forward.
