# Tasks: Visual Command for Post Style

## 1. Catalog

- [x] 1.1 Create a typed visual-command catalog containing exactly the 18 approved commands with `value`, `label`, and the verbatim catalog `description` from `docs/prompt-command-reference.md`.
- [x] 1.2 Add a test asserting the catalog has 18 unique entries and that each `value` and `description` matches the reference document.

## 2. Schema and Migration

- [x] 2.1 Replace `tone` with `visual_command` in `drizzle/schema.ts` using the 18-value enum, keeping all other post columns unchanged.
- [x] 2.2 Migration written by hand as `0005_visual_command_and_placement.sql` performing a table rebuild (new table, copy, drop, rename). `db:generate` was not used because the required legacy value mapping cannot be expressed by the generator.
- [x] 2.3 Ensure the migration maps every legacy tone value to `/infographic` and recreates `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
- [x] 2.4 Apply with `bun run db:migrate` and verify row count, post IDs, and foreign keys are preserved.

## 3. API

- [x] 3.1 Update the create-post schema and handler to accept `visual_command` and stop accepting `tone`.
- [x] 3.2 Update the update-post schema and handler to accept `visual_command` and stop accepting `tone`.
- [x] 3.3 Confirm every post response exposes `visual_command` and no longer exposes `tone`.
- [ ] 3.4 Add route tests: each of the 18 values is accepted, and an unapproved value such as `/cyberpunk` is rejected with a validation status.

## 4. Owner UI

- [x] 4.1 Replace the Tone control in `/owner/new` with a Visual Command control rendering each command and its catalog description.
- [x] 4.2 Replace the Tone control in `/owner/edit/[id]/detail`, seeding it from the stored value and submitting it on save.
- [x] 4.3 Replace tone display with visual command in the `/owner` post list.
- [x] 4.4 Replace tone display with visual command in `/owner/edit/[id]` and `/owner/generate/[id]` wherever tone is currently shown.

## 5. Prompt Pipeline

- [x] 5.1 Pass `visual_command` into synthesis input and provider-template construction.
- [x] 5.2 Express the command as natural-language visual direction from the catalog description, without asserting native provider command support.
- [x] 5.3 Verify all three provider variants receive the direction while retaining their existing provider-specific instructions.
- [x] 5.4 Confirm the fact-fidelity guard, prompt schema, defensive parsing, and research-approval gate are unchanged in behavior.

## 6. Public Surface

- [x] 6.1 Audit public feed and post detail pages for tone usage. No public post routes exist in `src/routes`, so there was nothing to change.

## 7. Verification

- [x] 7.1 `bun run check` passes with 0 errors.
- [ ] 7.2 `bun test --run` passes, including the new catalog, API, and migration tests. Catalog tests exist; API route tests and migration tests are still outstanding.
- [x] 7.3 `bun run lint` run and result reported. Prettier and ESLint both pass; the previously noted plugin failure did not recur.
- [x] 7.4 `openspec validate visual-command-post-style` passes.
- [ ] 7.5 Manual smoke test: create a post with a technical command, run research, approve, generate, and confirm the visual direction appears in all provider variants.
- [ ] 7.6 Update `DESIGN.md` and `AGENTS.md` only if implementation changes a stated fact.

## Dependencies

```
1 (catalog) -> 2 (schema) -> 3 (API) -> 4 (UI)
1 -> 5 (pipeline)
3 -> 6 (public surface)
all -> 7 (verification)
```
