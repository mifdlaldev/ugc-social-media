# Design: Explanatory Slide Copy

## Decision Summary

Add structured teaching fields per slide and stop forcing all rendered text through one 80-character key phrase. The narrative pattern is identical for every visual command; only the leading command token and the visual style differ.

Evidence boundaries are recorded in `docs/educational-carousel-copy-reference.md`. Owner requirements are recorded in `docs/owner-content-direction.md`. Neither file is a source of engineering facts.

## Data Model

Add nullable text columns to `prompt_slides`:

```text
slide_subtitle: nullable text
slide_explanation: nullable text
visual_labels: nullable text
slide_takeaway: nullable text
```

`slide_title` already exists. Nullable keeps previously generated rows valid without inventing content for them; the owner regenerates to obtain explanatory copy.

These are additive columns without CHECK constraints, so SQLite supports `ALTER TABLE prompt_slides ADD COLUMN` and no table rebuild is required. This differs from the `slide_count` range change in `carousel-narrative-structure`, which does require a rebuild because it alters a CHECK constraint.

`visual_labels` stores a short delimited list rather than a JSON array, matching the existing plain-text style of `visual_notes`. If a structured list becomes necessary, update this design first.

## Synthesis Contract

Extend the synthesis JSON schema so each slide returns:

```text
slide_index, slide_type, slide_title, slide_subtitle,
slide_explanation, visual_labels, slide_takeaway, research_context
```

Instruction requirements:

- Derive every factual statement only from the supplied research and topic.
- Preserve a source qualifier exactly. "hampir 95%" must not become "95%".
- Carry the source's condition or scope when it supplies one.
- Omit a claim absent from the research rather than completing it from model memory.
- Introduce a technical term before the slide whose mechanism depends on it.
- Write one teaching point per slide.
- Keep the hook a precise question or named mechanism; forbid unsupported fear language, superlatives, and absolutes.
- Use one direction language for the whole generation; audience-facing text stays Indonesian.

Parsing stays defensive: markdown fences, surrounding prose, and missing fields must fail with named errors rather than silently producing empty copy. Required fields are `slide_title`, `slide_explanation`, and `on_image_text`.

## Per-Slide Generation

The existing `buildVisualNotes` call currently returns `visual_notes` and `on_image_text`. It continues to own composition direction and the primary rendered text, but the teaching fields come from synthesis, not from this second call. This keeps the factual content in the stage that has the research packet.

`on_image_text` remains short because it is the text drawn in the artwork. Removing the "not a full sentence" rule is what allows a legible explanatory line where the slide needs one; it is not a licence for a paragraph of rendered text.

## Provider Templates

Each provider prompt gains separate labelled lines:

```text
Slide title: ...
Slide subtitle: ...        (omitted when absent)
Slide explanation: ...
Visual labels: ...
Slide takeaway: ...
```

Ordering and existing blocks are unchanged: the GPT Image variant still leads with the visual command token, and every variant still carries the style lock verbatim, the target canvas, the exact-text rule, and the exclusions block.

Labels must be requested near the components they identify, following the reviewed guidance on split attention. This is expressed as prompt direction, not as a guarantee of provider compliance.

## Density Heuristic

Target headline roughly 3–10 words and explanation roughly 1–3 short sentences or roughly 15–40 words. Record this as a heuristic. No authoritative limit exists, and the reviewed third-party figures conflict (15–30, 30–40, and 30–50 words per slide all appear).

When accurate explanation exceeds the heuristic, prefer splitting or shortening supported statements. Never drop a necessary condition or invent a replacement fact to meet a word count.

## UI

The generate page shows the teaching fields alongside the prompt so the owner can review the copy before use:

- headline and subtitle near the slide type badge;
- explanation as body text;
- labels and takeaway as compact secondary blocks.

The copy action still copies the provider prompt text. No third-party benchmark figure appears in UI copy.

## Testing

- Synthesis parser accepts the extended shape and rejects missing required fields.
- Qualifier preservation: a fixture snippet containing "hampir 95%" must not yield a bare "95%".
- Omission: a claim absent from the fixture research must not appear in any teaching field.
- Provider templates emit the labelled teaching lines for all three providers.
- Existing guarantees still hold: leading command token, verbatim style lock, exact-text rule, exclusions, correct canvas and ratio.
- Migration: existing slide rows remain readable with the new columns null.

Run `bun run check`, `bun test --run`, `bun run lint`, `openspec validate educational-carousel-copy`, and the pipeline smoke test.

## Explicit Non-Decisions

- No change to the visual command catalog, placement catalog, or style lock contract.
- No slide-count, progress-text, standalone-slide-2, or soft-CTA change; those belong to `carousel-narrative-structure`.
- No live fact-checking at generation time.
- No hard word-count limit encoded as a rule.
- No claim that this improves reach, engagement, or comprehension. One reviewed study reported engagement gains without a matching quiz-score gain.
