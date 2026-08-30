# Tasks: Hook-to-CTA Carousel Narrative

## 1. Reference

- [x] 1.1 Record researched carousel-structure findings in `docs/carousel-structure-reference.md`, marking source status and separating structural consensus from conflicting benchmark numbers.
- [ ] 1.2 Verify every requirement in this change is supported by that document, and drop any requirement that depends on an unverified benchmark.

## 2. Schema and Migration

- [ ] 2.1 Change `slide_count` in `drizzle/schema.ts` to a 5–10 range with default 7.
- [ ] 2.2 Write a new table-rebuild migration, because migration 0005 already wrote `CHECK(slide_count >= 3 AND slide_count <= 7)` and SQLite cannot alter a CHECK constraint in place.
- [ ] 2.3 Clamp legacy values: below 5 becomes 5, above 10 becomes 10, without rewriting existing generated slide rows.
- [ ] 2.4 Verify the applied constraint rejects 4 and 11 at the database level.

## 3. API

- [ ] 3.1 Update the create-post schema to accept 5–10 and default 7.
- [ ] 3.2 Update the update-post schema to accept 5–10.
- [ ] 3.3 Add route tests: 5, 7, and 10 accepted; 4 and 11 rejected.

## 4. Synthesis

- [ ] 4.1 Require exactly the requested slide count in the synthesis instruction.
- [ ] 4.2 Require slide index 0 to be the hook with a specific learning promise grounded in the topic.
- [ ] 4.3 Require slide index 1 to be a standalone context hook that does not continue slide 0 grammatically.
- [ ] 4.4 Require one self-contained idea per middle slide.
- [ ] 4.5 Require one soft save prompt at index `M-2`.
- [ ] 4.6 Require exactly one action on the final slide at index `M-1`.
- [ ] 4.7 Forbid invented facts, numbers, promises, handles, links, and lead magnets in slide content.
- [ ] 4.8 Fail with a retryable error when the model returns fewer slides than requested, instead of padding with invented content.

## 5. Prompt Pipeline

- [ ] 5.1 Pass role context and the slide's `N/M` position into every provider template.
- [ ] 5.2 Instruct exact progress text `N/M` as small artwork typography.
- [ ] 5.3 Keep the exclusions block prohibiting carousel dots, swipe arrows, page chrome, app or browser interface, device frames, borders, watermarks, and extra text.
- [ ] 5.4 Confirm the style lock, target canvas, exact-text rules, and leading visual command token remain unchanged in behavior.
- [ ] 5.5 Confirm the soft save prompt never replaces the final CTA in any generated set.

## 6. Owner UI

- [ ] 6.1 Update the slider in `/owner/new` to min 5, max 10, default 7.
- [ ] 6.2 Update the slider in `/owner/edit/[id]/detail` to the same range.
- [ ] 6.3 Update helper text to describe the 5–10 range without claiming algorithmic optimality.
- [ ] 6.4 Verify no third-party benchmark figure appears in UI copy.

## 7. Verification

- [ ] 7.1 Test generated ordering for 5, 7, and 10 slides.
- [ ] 7.2 Test that slide 2 carries a standalone instruction.
- [ ] 7.3 Test that exactly one soft save prompt exists and precedes the final slide.
- [ ] 7.4 Test that the final CTA requests exactly one action.
- [ ] 7.5 Test that every provider prompt contains the correct exact `N/M`.
- [ ] 7.6 Test that undersized synthesis output fails rather than inventing slides.
- [ ] 7.7 `bun run check`, `bun test --run`, and `bun run lint` pass.
- [ ] 7.8 `openspec validate carousel-narrative-structure` passes.
- [ ] 7.9 Manual smoke test: generate a 10-slide post and confirm hook, standalone slide 2, soft save prompt, single-action final CTA, and correct progress text.

## Dependencies

```
1 (reference) -> 4 (synthesis)
2 (schema) -> 3 (API) -> 6 (UI)
4 -> 5 (pipeline)
all -> 7 (verification)
```

Requires its own `posts` rebuild for the CHECK constraint. If `style_lock` already exists, the replacement table must carry it forward. Depends on `per-post-style-lock` for the shared style block.
