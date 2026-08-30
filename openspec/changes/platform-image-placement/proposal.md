# Proposal: Replace Post Platform with an Explicit Image Placement

## Context

Each post currently stores `platform` as a three-value enum (`instagram`, `facebook`, `linkedin`) in `drizzle/schema.ts`. `promptGenerator.ts` maps that value to a single aspect ratio through `ASPECT_BY_PLATFORM` (`instagram` → `1:1`, `facebook` → `4:5`, `linkedin` → `1.91:1`) and passes only the ratio string into provider templates.

The owner's goal is that the generated image is correct on the first attempt, without cropping or resizing afterwards. A platform name alone cannot achieve this: one platform supports several placements with different canvases, and the current mapping asserts a single ratio per platform.

Platform specifications were researched via You.com on 2026-08-30 and recorded verbatim, with source URLs and provenance, in `docs/platform-image-size-reference.md`.

## Problem

1. `platform` does not identify a placement, so the required canvas is ambiguous.
2. No pixel dimensions exist anywhere in the system, so prompts cannot state an exact canvas.
3. The current one-ratio-per-platform mapping is not accurate. Instagram alone officially accepts a ratio range from 1.91:1 to 4:5.
4. The platform list omits networks the owner uses.

## Solution

Replace `posts.platform` with `posts.platform_placement`: one value from a curated set of **13 placements**, each carrying an explicit platform, placement name, pixel width, pixel height, ratio, documented file limit where one exists, and a source-provenance marker.

Only placements whose platform officially documents at least a ratio, a width, or a file limit are included. Placements with no official specification are excluded rather than filled in with an assumed number.

### Included placements (13)

| Value | Label | Canvas | Ratio | Source status |
| --- | --- | --- | --- | --- |
| `instagram-feed-square` | Instagram — Feed Square | 1080 × 1080 | 1:1 | official-ratio-derived-canvas |
| `instagram-feed-portrait` | Instagram — Feed Portrait | 1080 × 1350 | 4:5 | official-ratio-derived-canvas |
| `instagram-feed-landscape` | Instagram — Feed Landscape | 1080 × 566 | 1.91:1 | official-ratio-derived-canvas |
| `instagram-stories` | Instagram — Stories | 1080 × 1920 | 9:16 | official-ads-doc |
| `facebook-feed-square` | Facebook — Feed Square | 1080 × 1080 | 1:1 | official-ratio-derived-canvas |
| `facebook-feed-portrait` | Facebook — Feed Portrait | 1080 × 1350 | 4:5 | official-ratio-derived-canvas |
| `facebook-stories` | Facebook — Stories | 1080 × 1920 | 9:16 | official-ads-doc |
| `x-instream-single-image` | X — In-stream Single Image | 1200 × 675 | 16:9 | official-ratio-derived-canvas |
| `youtube-community-image` | YouTube — Community Post Image | 1080 × 1080 | 1:1 | official-ratio-derived-canvas |
| `linkedin-single-image-portrait` | LinkedIn — Single Image Portrait | 1080 × 1350 | 4:5 | official-ratio-derived-canvas |
| `linkedin-single-image-square` | LinkedIn — Single Image Square | 1080 × 1080 | 1:1 | official-ratio-derived-canvas |
| `linkedin-single-image-landscape` | LinkedIn — Single Image Landscape | 1200 × 628 | 1.91:1 | official-ratio-derived-canvas |
| `pinterest-standard-pin` | Pinterest — Standard Pin | 1000 × 1500 | 2:3 | official |

### Excluded, with reason

Threads feed, WhatsApp Status, KASKUS thread image, and TikTok photo post are excluded because no official pixel specification was found. Facebook feed landscape 1200 × 630 is excluded because that figure is a third-party link-preview recommendation, not a documented photo-post specification. YouTube video thumbnail is excluded by owner decision because it is a video thumbnail, not an image post. Full reasoning and sources are in `docs/platform-image-size-reference.md`.

## Scope

### In Scope

- Migrate `posts.platform` to `posts.platform_placement` with the 13 approved values.
- A single typed placement catalog carrying value, platform, placement label, width, height, ratio, documented file limit, source status, and source URL.
- UI: grouped dropdown on `/owner/new` and `/owner/edit/[id]/detail` showing platform, placement, pixel canvas, and ratio in the option label.
- UI: show the selected placement wherever the platform is currently displayed.
- API: accept `platform_placement` on create and update, rejecting values outside the 13.
- Replace `ASPECT_BY_PLATFORM` so ratio and exact pixel dimensions both come from the selected placement and reach every provider variant.

### Out of Scope

- Video, carousel-specific, and multi-image placements. This change covers single-image placements only.
- Any excluded placement above.
- Automatic placement selection from the topic.
- Changes to `slide_count`, `post_status`, the research flow, or the Prompt Block Schema in `DESIGN.md` §6.
- Any claim that a provider guarantees exact output dimensions. The prompt states the target canvas; it does not prove provider compliance.

## Dependency

`visual-command-post-style` also rebuilds the `posts` table. Both changes MUST be applied through a **single table-rebuild migration** that replaces `tone` with `visual_command` and `platform` with `platform_placement` together. Two sequential rebuilds of the same table are not acceptable.

## Success Criteria

- The owner selects a placement at post creation and sees its exact canvas and ratio in the option.
- Existing posts migrate without data loss: `instagram` → `instagram-feed-square`, `facebook` → `facebook-feed-portrait`, `linkedin` → `linkedin-single-image-landscape`, preserving each post's current effective aspect ratio from `ASPECT_BY_PLATFORM`.
- Create and update reject a value outside the 13 approved placements.
- Every generated provider variant states the target pixel dimensions and ratio.
- Every catalog entry has a non-empty source URL and source status, enforced by a test.

## Risks

- Platform specifications change over time. Mitigation: `docs/platform-image-size-reference.md` records a verification date and requires re-verification before any addition.
- Not all figures carry equal authority. Mitigation: the source status field is stored and surfaced in the UI instead of presenting every number as official.
- Stating a canvas in a prompt does not guarantee the generator honours it. Mitigation: the specs state the canvas as a target, and no requirement asserts provider compliance.
