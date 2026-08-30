# Design: Per-Post Style Lock

## Decision Summary

Add a nullable `style_lock` text field to `posts`. A style lock is generated after research approval and before slide generation, then reused verbatim for all provider variants and all slides of that post.

The style lock is post-specific, not global. It locks the aesthetic system while leaving per-slide content creative. It is editable by the owner and is not silently changed by slide regeneration.

The evidence boundary is documented in `docs/gpt-image-consistency-reference.md`. Official OpenAI guidance supports concrete prompt structure, explicit preserve/change constraints, exact text constraints, and exclusions, but does not guarantee cross-generation consistency and does not document a `seed` parameter.

## Data Model

Add:

```text
posts.style_lock: nullable text
```

Nullable represents the pre-style-lock state and allows existing posts to be migrated without inventing a style. This is an additive field and does not require another `posts` rebuild beyond the already planned combined `tone`/`platform` migration.

Persist only the reviewed text and generation metadata already covered by `generation_attempts`. Do not store image files or provider credentials.

## Style Lock Content Contract

The generated style lock SHALL be an aesthetic-only text block containing:

- visual medium and rendering treatment;
- fixed colour palette;
- typography treatment and hierarchy;
- line, shape, icon, and texture language;
- background/canvas treatment;
- cross-slide invariants.

It MUST NOT contain topic facts, research claims, numbers, materials, dimensions, named engineering methods, standards, citations, or slide-specific text.

A style lock can be generated from topic, selected visual command, target placement, and approved research for contextual fit, but factual content is not allowed in its output. The service should explicitly tell the LLM that research is context for choosing aesthetics only and must not be repeated as facts.

## Generation Flow

1. Owner approves research.
2. Owner opens the style-lock step.
3. Server generates one style lock if requested.
4. Owner reviews and may edit/save or regenerate it.
5. Generation endpoint refuses to generate slides when `style_lock` is null or empty.
6. For each slide, the generator creates a per-slide visual direction. This direction may change composition, focal point, metaphor, and subject.
7. Each provider template inserts the exact stored style-lock text without paraphrase.
8. Each provider template inserts explicit exclusions and exact on-image-text constraints.
9. GPT Image template starts with the exact selected visual command token, then continues with the rest of the structured prompt. The labelled `Visual form` line remains for clarity.
10. Slide regeneration reads the existing style lock and does not call the style-lock generator unless the owner explicitly requests regeneration.

## Prompt Sections

Use labelled line breaks to keep the prompt skimmable:

1. leading visual command token (GPT Image only);
2. intended artifact and placement;
3. topic and slide identity;
4. visual form;
5. exact on-image text;
6. per-slide visual direction;
7. `STYLE LOCK — PRESERVE VERBATIM` block;
8. target canvas, width, height, and ratio;
9. exact-text constraints;
10. explicit exclusions;
11. provider-specific finishing instructions.

The style lock is repeated verbatim. Its location is a template decision, not a claim that earlier tokens receive more weight; the research found no official OpenAI statement proving universal positional weighting.

## API Surface

Add owner-authenticated routes:

- `POST /api/posts/:id/style-lock` — generate and persist one style lock; requires approved research.
- `GET /api/posts/:id/style-lock` — return the current style lock state.
- `PUT /api/posts/:id/style-lock` — save owner-edited style-lock text; reject empty text and enforce a bounded length.
- `POST /api/posts/:id/style-lock/regenerate` — explicitly replace the current style lock; requires approved research.

The exact approval-state persistence mechanism is TBD because current implementation treats research approval as an endpoint gate rather than a stored post status. Implementation must inspect the current route behavior and avoid inventing a new status column without updating this design.

## UI Surface

Add a style-lock review step between research approval and generate:

- show the generated style lock in an editable textarea;
- show a clear statement that it controls aesthetics only;
- provide Save and Regenerate actions;
- provide a Continue to Generate action only when non-empty style lock exists;
- show a concise warning that generation reuses the style lock unless Regenerate is explicitly chosen.

The generate page should show a compact style-lock summary and the target placement/canvas near the copy action, without duplicating the full block unnecessarily.

## Provider Rules

- GPT Image: prefix exact command token, retain visual-form line, include style lock, exact text, exclusions, and target canvas.
- Nano Banana: keep visual-heavy/provider-specific wording, include the same style lock, exact text, exclusions, and target canvas.
- Recraft: keep vector/provider-specific wording, include the same style lock, exact text, exclusions, and target canvas.

No provider capability is inferred from the owner PDFs. The command token is a prompt convention, not a native API call.

## Testing

Add tests for:

- style-lock parser/validation accepts aesthetic-only content and rejects empty output;
- style-lock generation is blocked before research approval;
- owner edit persists exact text;
- slide generation is blocked without a style lock;
- all slides and all providers contain byte-identical style lock text;
- slide regeneration preserves the style lock;
- GPT Image prompt begins with the selected command token;
- every provider includes exact-text and exclusion instructions;
- no style-lock field introduces research facts;
- no use or assumption of a `seed` parameter.

Run `bun run check`, `bun test --run`, `bun run lint`, and `openspec validate per-post-style-lock`.

## Explicit Non-Decisions

- No global brand style lock across posts.
- No automatic image generation.
- No reference-image upload or storage.
- No seed parameter.
- No claim that exclusions, dimensions, text, or consistency are guaranteed by an external provider.
