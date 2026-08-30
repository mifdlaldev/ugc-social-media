# Design: Hook-to-CTA Carousel Narrative

## Decision Summary

Set the supported post range to 5–10 slides with a default of 7. Generate a fixed narrative spine and let the topic and approved research fill the middle content. This is a content-structure rule, not a claim about algorithm performance.

The evidence and its confidence levels are recorded in `docs/carousel-structure-reference.md`. The implementation uses only the cross-source structural findings, not conflicting engagement percentages or "optimal" length claims.

## Role Model

Keep the existing `SlideType` values where possible. Use the current `hook`, `problem`, `data`, `solution`, `cta`, and `custom` fields with these additional constraints:

- index 0: `hook`, with a specific learning promise or curiosity gap grounded in the topic;
- index 1: `problem`, `data`, or `custom`, but its content must be a standalone context hook and must not be grammatical continuation of index 0;
- indices 2 through `M-3`: self-contained `problem`, `data`, `solution`, or `custom` content, one idea per slide;
- index `M-2`: summary or takeaway with one soft save prompt; its type may be `solution` or `custom`;
- index `M-1`: `cta`, with one final action only.

For 5 slides this becomes hook, standalone context, value, takeaway + soft save, final CTA. For 10 slides it becomes hook, standalone context, six value slides, summary + soft save, final CTA.

The source schema has no dedicated `soft_cta` type. Do not add a new database enum unless implementation shows that existing types cannot represent the requirement; if a new type is necessary, update this design and the delta spec before implementation.

## CTA Rules

The default soft prompt is a save-oriented action because educational engineering content is reference-oriented. The prompt must be adapted to the supplied topic and must not promise a template, guide, result, or resource that does not exist.

The final CTA must select one action. The implementation may choose save or follow as a product default, but it must not combine save + follow + comment + link in a single CTA. It must not invent a handle, link, contact method, lead magnet, or promised DM.

Exact CTA wording is generated from the topic and role context, not copied as a factual claim from research sources.

## Progress Text

Every slide gets an exact required string `N/M` in its prompt. This is deliberate artwork typography, not a carousel UI element. The exclusions block continues to prohibit dots, swipe arrows, fake page controls, browser chrome, app navigation, device frames, borders, watermarks, and extra text.

The required progress string is passed alongside the existing `on_image_text`. It must not be placed in the database's `on_image_text` field if that field is intended to represent the primary message; instead, the prompt template may add it as a separate exact-text instruction. If the implementation changes the persisted shape, update the schema and this design first.

## Synthesis Prompt

Update the synthesis system instruction to require:

- exactly the requested number of slides;
- slide 0 as hook;
- slide 1 as standalone context hook;
- one self-contained idea per middle slide;
- one soft save prompt at index `M-2`;
- one final action at index `M-1`;
- no unsupported facts, numerical claims, or promises;
- Indonesian output.

The parser should validate count and ordering rather than silently truncating an undersized result. If the model returns fewer slides than requested, fail with a retryable error instead of filling missing slides with invented content.

## Migration

The existing `posts.slide_count` constraint changes from 3–7/default 5 to 5–10/default 7.

The earlier combined rebuild is already applied as `drizzle/migrations/0005_visual_command_and_placement.sql`, which wrote `CHECK(slide_count >= 3 AND slide_count <= 7)`. SQLite cannot alter a CHECK constraint in place, so this change requires **its own** table rebuild: create a replacement `posts` table with the new constraint and default, copy rows while clamping values, drop, rename, and recreate `posts_author_idx`, `posts_status_idx`, and `posts_created_idx`.

If `per-post-style-lock` has not yet added `style_lock` when this work starts, the replacement table must still include that column so the rebuild does not drop it.

For existing posts, map counts below 5 to 5 and counts above 10 to 10. This preserves the post but does not rewrite existing generated slide rows. The owner must explicitly regenerate to obtain the new narrative. The exact SQL must be verified against the actual current schema before implementation.

## Provider Prompt Changes

All three provider variants receive the same role context, exact `N/M` progress instruction, style lock, target canvas, exact-text rules, and exclusions. Provider-specific instructions remain distinct.

The GPT Image variant continues to start with the selected visual command token. The visual command and style lock do not determine the narrative facts. Research and topic remain the only factual sources.

## UI Changes

Update create/edit forms:

- slider min 5, max 10, default 7;
- helper text explaining the five-to-ten range;
- no claim that 7 is algorithmically optimal.

The generate page should make the role and progress context visible where useful, but it should not expose third-party benchmark numbers as product guidance.

## Testing

Add tests for:

- schema/API accepts 5, 7, and 10 and rejects 4 and 11;
- defaults are 7;
- migration clamps legacy values without rewriting existing prompt rows;
- generated ordering for 5, 7, and 10;
- slide 2 standalone instruction;
- exactly one soft save prompt before the final slide;
- final CTA has exactly one action;
- every provider prompt contains exact `N/M` for its slide;
- fake UI elements remain excluded;
- undersized synthesis fails rather than inventing missing slides;
- factual content remains grounded in approved research/topic.

Run `bun run check`, `bun test --run`, `bun run lint`, and `openspec validate carousel-narrative-structure`.

## Explicit Non-Decisions

- No algorithm or engagement guarantee.
- No benchmark-driven automatic optimization.
- No video or mixed-media support.
- No caption, hashtag, DM automation, or automatic posting.
- No extra CTA actions invented from third-party examples.
