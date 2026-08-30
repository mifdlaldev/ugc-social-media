# Design: Explicit Image Placement Selection

## Decision Summary

Replace `posts.platform` with `posts.platform_placement`. The stored value identifies one single-image placement and resolves to an exact pixel canvas, a ratio, and a documented file limit where one exists. `ASPECT_BY_PLATFORM` in `promptGenerator.ts` is removed; ratio and dimensions both come from the placement catalog.

Authoritative figures live in `docs/platform-image-size-reference.md`, which records a verification date of 2026-08-30, a source URL per row, and a provenance status per row. The application catalog must not contain a placement absent from that document.

## Placement Catalog

One typed, server-shared catalog. Each entry carries:

- `value`: stable slug used in the database and API
- `platform`: display platform name
- `placement`: display placement name
- `width`, `height`: integers, the exact target canvas
- `ratio`: display ratio string
- `fileSizeLimit`: documented limit, or explicitly absent when the platform documents none
- `sourceStatus`: `official`, `official-ratio-derived-canvas`, or `official-ads-doc`
- `sourceUrl`: citable URL

`fileSizeLimit` must be able to represent "not documented" distinctly from a number. Do not substitute a default number when a platform documents none.

The API validation enum, the UI option list, and the prompt pipeline all derive from this single catalog. A test asserts the catalog matches the reference document and that no entry has an empty `sourceUrl` or `sourceStatus`.

## Data Migration

This change and `visual-command-post-style` both rebuild the `posts` table. They MUST share **one** table-rebuild migration:

1. Create a replacement `posts` table replacing `tone` with `visual_command` and `platform` with `platform_placement`, keeping every other column unchanged.
2. Copy all rows.
3. Map legacy platform values so each post keeps the aspect ratio it effectively had under `ASPECT_BY_PLATFORM`:
   - `instagram` (was 1:1) → `instagram-feed-square`
   - `facebook` (was 4:5) → `facebook-feed-portrait`
   - `linkedin` (was 1.91:1) → `linkedin-single-image-landscape`
4. Map every legacy tone value to `/infographic`, per `visual-command-post-style`.
5. Drop the old table and rename the replacement.
6. Recreate `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.
7. Verify row count, post IDs, and foreign keys before applying to production D1.

Exact SQL, the migration filename, and D1 compatibility are TBD until implementation and must be verified against the existing migration style rather than assumed.

## API Changes

- `POST /api/posts`: accept `platform_placement`, restricted to the 13 catalog values; stop accepting `platform`.
- `PUT /api/posts/:id`: accept `platform_placement`; stop accepting `platform`.
- Post responses expose `platform_placement` and no longer expose `platform`.
- Server-side validation remains authoritative even though the UI renders the same list.

Authentication, slide-count validation, post-status logic, and the research and generation routes are unchanged.

## UI Changes

Both authoring entry points use the same control:

- `/owner/new` and `/owner/edit/[id]/detail`: a grouped select. Options are grouped by platform using `Select.Group`, because a flat list of 13 is hard to scan. Each option label states platform, placement, canvas, and ratio, for example `Instagram — Feed Portrait · 1080×1350 · 4:5`.
- Default selection: `instagram-feed-portrait`. Rationale: 4:5 is the largest canvas Instagram accepts in feed, which suits dense educational infographics.
- Source provenance is shown as secondary helper text, not a prominent badge, so an official figure is not visually equated with a derived canvas.
- `/owner`, `/owner/edit/[id]`, and `/owner/generate/[id]`: replace the platform display with the selected placement.

Placements whose figures come from advertising documentation must not be labelled as organic-posting specifications in the UI text.

## Prompt Pipeline Changes

- Remove `ASPECT_BY_PLATFORM`.
- Resolve width, height, and ratio from the stored placement and pass all three into synthesis context and every provider template.
- Express dimensions as target output requirements, alongside the existing visual command direction.
- Do not assert that any external generator guarantees the requested pixel dimensions.

The fact-fidelity guard, prompt schema, defensive parsing, research approval gate, and generation-attempt persistence remain unchanged.

## Testing and Verification

- Catalog completeness: exactly 13 entries, unique values, each matching `docs/platform-image-size-reference.md`.
- Provenance: no entry with an empty `sourceUrl` or `sourceStatus`.
- Exclusions: no entry for Threads, WhatsApp Status, KASKUS, TikTok photo post, Facebook feed landscape 1200 × 630, or YouTube thumbnail.
- API: every approved value accepted; an excluded value such as `tiktok-photo-post` rejected.
- Migration: legacy platform mapping preserves the previous effective ratio; row count and post IDs preserved.
- Pipeline: all three provider variants carry the correct width, height, and ratio.

Run `bun run check`, `bun test --run`, `bun run lint`, and `openspec validate platform-image-placement`.

## Explicit Non-Decisions

- No video, carousel, or multi-image placements.
- No placement without an official ratio, width, or file-limit citation.
- No automatic placement inference from the topic.
- No guarantee of provider output dimensions.
- No image generation inside the application.
