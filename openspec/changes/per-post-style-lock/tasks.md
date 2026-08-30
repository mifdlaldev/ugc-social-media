# Tasks: Per-Post Style Lock

## 1. Reference Documentation

- [x] 1.1 Record the researched GPT Image prompting guidance in `docs/gpt-image-consistency-reference.md`, separating official OpenAI sources from third-party and community claims.
- [ ] 1.2 Cross-check every prompt requirement in this change against that document and remove any requirement it does not support.

## 2. Schema

- [ ] 2.1 Add a nullable `style_lock` text column to `posts` in `drizzle/schema.ts`.
- [ ] 2.2 Fold this column into the already planned combined `posts` rebuild migration rather than issuing a second rebuild.
- [ ] 2.3 Verify existing posts migrate with `style_lock` null and no invented default text.

## 3. Style Lock Service

- [ ] 3.1 Create a style-lock generation service that returns an aesthetic-only text block.
- [ ] 3.2 Instruct the model that research and topic are context for choosing aesthetics only, and that no fact, number, material, dimension, named method, standard, or citation may appear in the output.
- [ ] 3.3 Parse defensively and fail with a clear retryable error rather than returning empty text.
- [ ] 3.4 Persist the attempt using the existing `generation_attempts` mechanism without storing secrets.

## 4. API

- [ ] 4.1 Add `POST /api/posts/:id/style-lock` to generate and persist one style lock, gated on approved research.
- [ ] 4.2 Add `GET /api/posts/:id/style-lock` to return the current state.
- [ ] 4.3 Add `PUT /api/posts/:id/style-lock` to save owner-edited text, rejecting empty text and enforcing a bounded length.
- [ ] 4.4 Add `POST /api/posts/:id/style-lock/regenerate` for explicit replacement.
- [ ] 4.5 Block `POST /api/posts/:id/generate` when `style_lock` is null or empty, returning a clear error.
- [ ] 4.6 Inspect how research approval is currently enforced and reuse that mechanism; do not invent a new status column without updating design.md.

## 5. Prompt Pipeline

- [ ] 5.1 Read the stored style lock in `promptGenerator.ts` and insert it verbatim into all three provider templates.
- [ ] 5.2 Emit the selected visual command as the first token of the GPT Image prompt while keeping the labelled visual-form line.
- [ ] 5.3 Mark on-image text as exact and verbatim, instructing that no extra characters or additional text be rendered, and that Indonesian text not be translated or transliterated.
- [ ] 5.4 Add the exclusions block covering carousel dot indicators, page indicators, swipe arrows, application or browser interface, device frames, decorative borders, frames, watermarks, logos, signatures, QR codes, and placeholder text.
- [ ] 5.5 Keep per-slide visual direction free to vary subject, composition, focal point, and metaphor.
- [ ] 5.6 Ensure slide regeneration reuses the stored style lock and never regenerates it implicitly.

## 6. Owner UI

- [ ] 6.1 Add a style-lock review step between research approval and generate, with an editable textarea.
- [ ] 6.2 State plainly that the style lock controls aesthetics only and must not contain facts.
- [ ] 6.3 Provide Save, Regenerate, and Continue to Generate actions, enabling Continue only when a non-empty style lock exists.
- [ ] 6.4 Warn that generating slides reuses the stored style lock unless Regenerate is chosen.
- [ ] 6.5 Show a compact style-lock summary plus target placement and canvas near the copy action on the generate page.

## 7. Verification

- [ ] 7.1 Test that style-lock generation is blocked before research approval.
- [ ] 7.2 Test that slide generation is blocked without a style lock.
- [ ] 7.3 Test that owner-edited text persists exactly.
- [ ] 7.4 Test that all slides and all three providers contain byte-identical style lock text.
- [ ] 7.5 Test that slide regeneration preserves the style lock.
- [ ] 7.6 Test that the GPT Image prompt begins with the selected command token.
- [ ] 7.7 Test that every provider prompt includes exact-text and exclusion instructions.
- [ ] 7.8 Confirm no code path uses or assumes a `seed` parameter.
- [ ] 7.9 `bun run check`, `bun test --run`, and `bun run lint` pass.
- [ ] 7.10 `openspec validate per-post-style-lock` passes.
- [ ] 7.11 Manual smoke test: create a post, research, approve, generate a style lock, edit it, generate slides, and confirm all slides share the style lock and the exclusions appear.

## Dependencies

```
1 (reference) -> 3 (service)
2 (schema) -> 4 (API) -> 6 (UI)
3 -> 4
4 -> 5 (pipeline)
all -> 7 (verification)
```

Depends on the combined `posts` rebuild shared with `visual-command-post-style` and `platform-image-placement`.
