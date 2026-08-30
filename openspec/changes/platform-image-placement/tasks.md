# Tasks: Explicit Image Placement

## 1. Placement Catalog

- [ ] 1.1 Create a typed placement catalog with exactly the 13 approved entries, each carrying `value`, `platform`, `placement`, `width`, `height`, `ratio`, `fileSizeLimit`, `sourceStatus`, and `sourceUrl`.
- [ ] 1.2 Represent an undocumented file limit distinctly from a numeric limit; do not substitute a default.
- [ ] 1.3 Add a test asserting 13 unique entries that match `docs/platform-image-size-reference.md`.
- [ ] 1.4 Add a test asserting no entry has an empty `sourceUrl` or `sourceStatus`.
- [ ] 1.5 Add a test asserting the catalog contains no entry for Threads, WhatsApp Status, KASKUS, TikTok photo post, Facebook feed landscape 1200 × 630, or YouTube thumbnail.

## 2. Schema and Shared Migration

- [ ] 2.1 Replace `platform` with `platform_placement` in `drizzle/schema.ts` using the 13-value enum.
- [ ] 2.2 Coordinate with `visual-command-post-style` so `tone` → `visual_command` and `platform` → `platform_placement` land in one table-rebuild migration.
- [ ] 2.3 Generate the migration and verify the emitted SQL performs a rebuild (new table, copy, drop, rename), not an unsupported column alteration.
- [ ] 2.4 Implement legacy mapping preserving the prior effective ratio: `instagram` → `instagram-feed-square`, `facebook` → `facebook-feed-portrait`, `linkedin` → `linkedin-single-image-landscape`.
- [ ] 2.5 Recreate `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
- [ ] 2.6 Apply the migration and verify row count, post IDs, and foreign keys are preserved.

## 3. API

- [ ] 3.1 Update the create-post schema and handler to accept `platform_placement` and stop accepting `platform`.
- [ ] 3.2 Update the update-post schema and handler to accept `platform_placement` and stop accepting `platform`.
- [ ] 3.3 Confirm post responses expose `platform_placement` and no longer expose `platform`.
- [ ] 3.4 Add route tests: all 13 values accepted; an excluded value such as `tiktok-photo-post` rejected with a validation status.

## 4. Owner UI

- [ ] 4.1 Replace the Platform control in `/owner/new` with a placement select grouped by platform, labelling each option with platform, placement, canvas, and ratio.
- [ ] 4.2 Default the control to `instagram-feed-portrait`.
- [ ] 4.3 Show source provenance as secondary helper text, without equating derived canvases with official specifications.
- [ ] 4.4 Replace the Platform control in `/owner/edit/[id]/detail`, seeding from the stored value.
- [ ] 4.5 Replace platform display with the selected placement in `/owner`, `/owner/edit/[id]`, and `/owner/generate/[id]`.

## 5. Prompt Pipeline

- [ ] 5.1 Remove `ASPECT_BY_PLATFORM` from `promptGenerator.ts`.
- [ ] 5.2 Resolve width, height, and ratio from the stored placement and pass them into synthesis context and all provider templates.
- [ ] 5.3 Express dimensions as target output requirements without asserting provider compliance.
- [ ] 5.4 Add a test confirming all three provider variants carry the correct width, height, and ratio.
- [ ] 5.5 Confirm the fact-fidelity guard, prompt schema, defensive parsing, and research approval gate are behaviourally unchanged.

## 6. Public Surface

- [ ] 6.1 Audit the public feed and post detail pages for `platform` usage and update or remove those references.

## 7. Verification

- [ ] 7.1 `bun run check` passes with 0 errors.
- [ ] 7.2 `bun test --run` passes, including the new catalog, API, migration, and pipeline tests.
- [ ] 7.3 `bun run lint` run and result reported, including the known Prettier Tailwind plugin failure if it still occurs.
- [ ] 7.4 `openspec validate platform-image-placement` passes.
- [ ] 7.5 Manual smoke test: create a post with a non-Instagram placement, run research, approve, generate, and confirm the exact canvas appears in all provider variants.
- [ ] 7.6 Update `DESIGN.md` if implementation changes a stated fact about platform or aspect-ratio handling.

## Dependencies

```
1 (catalog) -> 2 (schema, shared with visual-command-post-style) -> 3 (API) -> 4 (UI)
1 -> 5 (pipeline)
3 -> 6 (public surface)
all -> 7 (verification)
```
