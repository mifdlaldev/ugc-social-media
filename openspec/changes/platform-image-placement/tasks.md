# Tasks: Explicit Image Placement

## 1. Placement Catalog

- [x] 1.1 Create a typed placement catalog with exactly the 13 approved entries, each carrying `value`, `platform`, `placement`, `width`, `height`, `ratio`, `fileSizeLimit`, `sourceStatus`, and `sourceUrl`.
- [x] 1.2 Represent an undocumented file limit distinctly from a numeric limit; do not substitute a default.
- [x] 1.3 Add a test asserting 13 unique entries that match `docs/platform-image-size-reference.md`.
- [x] 1.4 Add a test asserting no entry has an empty `sourceUrl` or `sourceStatus`.
- [x] 1.5 Add a test asserting the catalog contains no entry for Threads, WhatsApp Status, KASKUS, TikTok photo post, Facebook feed landscape 1200 × 630, or YouTube thumbnail.

## 2. Schema and Shared Migration

- [x] 2.1 Replace `platform` with `platform_placement` in `drizzle/schema.ts` using the 13-value enum.
- [x] 2.2 Both column swaps landed in one rebuild: `0005_visual_command_and_placement.sql`.
- [x] 2.3 Migration hand-written as a rebuild (new table, copy, drop, rename) and verified against the applied local schema. `db:generate` was not used because the legacy value mapping cannot be expressed by the generator.
- [x] 2.4 Implement legacy mapping preserving the prior effective ratio: `instagram` → `instagram-feed-square`, `facebook` → `facebook-feed-portrait`, `linkedin` → `linkedin-single-image-landscape`.
- [x] 2.5 Recreate `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
- [x] 2.6 Apply the migration and verify row count, post IDs, and foreign keys are preserved.

## 3. API

- [x] 3.1 Update the create-post schema and handler to accept `platform_placement` and stop accepting `platform`.
- [x] 3.2 Update the update-post schema and handler to accept `platform_placement` and stop accepting `platform`.
- [x] 3.3 Confirm post responses expose `platform_placement` and no longer expose `platform`.
- [ ] 3.4 Add route tests: all 13 values accepted; an excluded value such as `tiktok-photo-post` rejected with a validation status.

## 4. Owner UI

- [x] 4.1 Replace the Platform control in `/owner/new` with a placement select grouped by platform, labelling each option with platform, placement, canvas, and ratio.
- [x] 4.2 Default the control to `instagram-feed-portrait`.
- [x] 4.3 Show source provenance as secondary helper text, without equating derived canvases with official specifications.
- [x] 4.4 Replace the Platform control in `/owner/edit/[id]/detail`, seeding from the stored value.
- [x] 4.5 Replace platform display with the selected placement in `/owner`, `/owner/edit/[id]`, and `/owner/generate/[id]`.

## 5. Prompt Pipeline

- [x] 5.1 Remove `ASPECT_BY_PLATFORM` from `promptGenerator.ts`.
- [x] 5.2 Resolve width, height, and ratio from the stored placement and pass them into synthesis context and all provider templates.
- [x] 5.3 Express dimensions as target output requirements without asserting provider compliance.
- [ ] 5.4 Add a test confirming all three provider variants carry the correct width, height, and ratio. A catalog-to-enum aspect-ratio coverage test exists; the per-variant assertion is still outstanding.
- [x] 5.5 Confirm the fact-fidelity guard, prompt schema, defensive parsing, and research approval gate are behaviourally unchanged.

## 6. Public Surface

- [x] 6.1 Audit the public feed and post detail pages for `platform` usage. No public post routes exist in `src/routes`, so there was nothing to change.

## 7. Verification

- [x] 7.1 `bun run check` passes with 0 errors.
- [ ] 7.2 `bun test --run` passes, including the new catalog, API, migration, and pipeline tests. Catalog and aspect-ratio tests exist; API route, migration, and per-variant pipeline tests are still outstanding.
- [x] 7.3 `bun run lint` run and result reported. Prettier and ESLint both pass.
- [x] 7.4 `openspec validate platform-image-placement` passes.
- [ ] 7.5 Manual smoke test: create a post with a non-Instagram placement, run research, approve, generate, and confirm the exact canvas appears in all provider variants.
- [ ] 7.6 Update `DESIGN.md` if implementation changes a stated fact about platform or aspect-ratio handling.

## Dependencies

```
1 (catalog) -> 2 (schema, shared with visual-command-post-style) -> 3 (API) -> 4 (UI)
1 -> 5 (pipeline)
3 -> 6 (public surface)
all -> 7 (verification)
```
