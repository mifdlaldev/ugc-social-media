# Tasks: Visual Command for Post Style

## 1. Catalog

- [ ] 1.1 Create a typed visual-command catalog containing exactly the 18 approved commands with `value`, `label`, and the verbatim catalog `description` from `docs/prompt-command-reference.md`.
- [ ] 1.2 Add a test asserting the catalog has 18 unique entries and that each `value` and `description` matches the reference document.

## 2. Schema and Migration

- [ ] 2.1 Replace `tone` with `visual_command` in `drizzle/schema.ts` using the 18-value enum, keeping all other post columns unchanged.
- [ ] 2.2 Generate the migration with `bun run db:generate` and verify the emitted SQL performs a table rebuild (new table, copy, drop, rename) rather than an unsupported column alteration.
- [ ] 2.3 Ensure the migration maps every legacy tone value to `/infographic` and recreates `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
- [ ] 2.4 Apply with `bun run db:migrate` and verify row count, post IDs, and foreign keys are preserved.

## 3. API

- [ ] 3.1 Update the create-post schema and handler to accept `visual_command` and stop accepting `tone`.
- [ ] 3.2 Update the update-post schema and handler to accept `visual_command` and stop accepting `tone`.
- [ ] 3.3 Confirm every post response exposes `visual_command` and no longer exposes `tone`.
- [ ] 3.4 Add route tests: each of the 18 values is accepted, and an unapproved value such as `/cyberpunk` is rejected with a validation status.

## 4. Owner UI

- [ ] 4.1 Replace the Tone control in `/owner/new` with a Visual Command control rendering each command and its catalog description.
- [ ] 4.2 Replace the Tone control in `/owner/edit/[id]/detail`, seeding it from the stored value and submitting it on save.
- [ ] 4.3 Replace tone display with visual command in the `/owner` post list.
- [ ] 4.4 Replace tone display with visual command in `/owner/edit/[id]` and `/owner/generate/[id]` wherever tone is currently shown.

## 5. Prompt Pipeline

- [ ] 5.1 Pass `visual_command` into synthesis input and provider-template construction.
- [ ] 5.2 Express the command as natural-language visual direction from the catalog description, without asserting native provider command support.
- [ ] 5.3 Verify all three provider variants receive the direction while retaining their existing provider-specific instructions.
- [ ] 5.4 Confirm the fact-fidelity guard, prompt schema, defensive parsing, and research-approval gate are unchanged in behavior.

## 6. Public Surface

- [ ] 6.1 Audit public feed and post detail pages for tone usage and update or remove those references.

## 7. Verification

- [ ] 7.1 `bun run check` passes with 0 errors.
- [ ] 7.2 `bun test --run` passes, including the new catalog, API, and migration tests.
- [ ] 7.3 `bun run lint` run and result reported, including the known Prettier Tailwind plugin failure if it still occurs.
- [ ] 7.4 `openspec validate visual-command-post-style` passes.
- [ ] 7.5 Manual smoke test: create a post with a technical command, run research, approve, generate, and confirm the visual direction appears in all provider variants.
- [ ] 7.6 Update `DESIGN.md` and `AGENTS.md` only if implementation changes a stated fact.

## Dependencies

```
1 (catalog) -> 2 (schema) -> 3 (API) -> 4 (UI)
1 -> 5 (pipeline)
3 -> 6 (public surface)
all -> 7 (verification)
```
