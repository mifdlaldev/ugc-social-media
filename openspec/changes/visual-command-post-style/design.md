# Design: Curated Visual Command for Post Creation

## Decision Summary

Replace `posts.tone` with `posts.visual_command`. The field is a stored selection made during post authoring and is passed through research, synthesis, and prompt generation. It is not selected or inferred on the generate page.

The authoritative command metadata is the approved 18-item subset listed in `proposal.md` and sourced from `docs/prompt-command-reference.md`. The implementation must not create a second unverified command list in a different layer.

## Data Migration

SQLite does not provide a portable enum alteration for the current Drizzle representation. Use a table rebuild migration:

1. Create a replacement `posts` table with the current columns, replacing `tone` with `visual_command` and the exact 18-value check constraint if supported by the selected migration syntax.
2. Copy all existing post columns into the replacement table.
3. Map every existing tone value (`detail`, `observatif`, `informatif`, `menjual`, `creative`) to `/infographic`, the agreed neutral visual default. Do not infer a more specific command.
4. Drop the old table and rename the replacement table to `posts`.
5. Recreate `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
6. Verify foreign-key integrity and row preservation before applying the migration to production D1.

The exact SQL must be verified against the existing migration style and local SQLite/D1 compatibility before implementation. Migration filename and generated SQL are TBD until implementation.

## Domain Catalog

Create one server-shared typed catalog containing, for each approved command:

- `value`: exact slash command string
- `label`: display label derived from the exact command name, without renaming the command
- `description`: exact catalog description
- `category`: one of the approved UI grouping labels, only if the grouping is defined during implementation without changing command meaning

The source of truth for command values and descriptions is `docs/prompt-command-reference.md`. The API validation enum and UI options must be derived from the same catalog or be checked against it in tests.

The UI may group commands into broad neutral groups such as `Diagram & Data`, `Technical Structure`, and `Notes & Presentation` only as navigation labels. Grouping must not add claims to a command description. If grouping is not needed, a flat list is preferred.

## API Changes

Update the existing post schemas and handlers:

- `POST /api/posts`: require or default `visual_command` according to the existing create-post default behavior; accept only one of the 18 values.
- `PUT /api/posts/:id`: allow updating `visual_command` and reject unsupported values.
- Responses expose `visual_command` and no longer expose `tone`.
- Keep authentication, platform validation, slide-count validation, and post-status logic unchanged.

Validation remains server-side even when the UI renders the same list.

## UI Changes

Update both authoring entry points:

- `/owner/new`: replace Tone with Visual Command. Each option displays the exact slash command and its catalog description. Submit the selected value when creating the post.
- `/owner/edit/[id]/detail`: initialize and submit the stored `visual_command` using the same catalog and control.
- `/owner`: replace any tone badge with the selected visual command.
- `/owner/edit/[id]` and `/owner/generate/[id]`: replace tone display/usage with the selected visual command where currently shown.

The selected command is visible before research and remains stable through the research approval flow.

## Prompt Pipeline Changes

Extend the input context of synthesis and provider-template construction with `visual_command`.

The prompt language must express the command as a natural-language visual direction using the catalog description. It may include the exact slash command as a labeled reference if the approved output UX requires it, but it must not present the slash command as a native provider instruction.

The command controls visual form only. It must not:

- add facts, measurements, materials, standards, citations, or technical claims;
- override approved research or the topic;
- alter platform aspect-ratio rules;
- alter provider-specific behavior without separate verification;
- create image files inside the app.

Existing provider separation, research approval, prompt schema, defensive parsing, and fidelity guard remain in force.

## Testing and Verification

Add or update tests for:

- exact 18-value catalog completeness and no duplicate values;
- API acceptance of every approved value;
- API rejection of an unapproved catalog value such as `/cyberpunk`;
- legacy tone migration to `/infographic` and preservation of post IDs/row count;
- command propagation into all three provider variants;
- absence of unsupported factual content introduced by command metadata;
- create and edit forms submitting `visual_command`.

Run `bun run check`, `bun test --run`, `bun run lint`, and `openspec validate visual-command-post-style`. `bun run lint` remains subject to the already documented Prettier Tailwind plugin failure and must be reported if still blocked.

## Explicit Non-Decisions

- No automatic command selection from topic.
- No use of all 500 commands as UI choices.
- No use of all 50 commands as UI choices.
- No short/detail mode selector.
- No provider capability assumptions based only on the PDFs.
- No OpenSpec archival until implementation is complete and all task boxes are checked.
