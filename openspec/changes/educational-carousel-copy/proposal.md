# Proposal: Explanatory Slide Copy for Educational Carousels

## Context

The generator currently produces two text fields per slide, from `SYSTEM_PROMPT` in `promptGenerator.ts`:

- `visual_notes` — composition direction, capped at roughly 200 characters
- `on_image_text` — capped at 80 characters, explicitly required to be "a key phrase, NOT a full sentence"

The owner tested the first post ("Kegunaan Kolom Bangunan", 5 slides, `/infographic`, Instagram Feed Square) and found the resulting images uninformative: each slide carried one large headline and nothing that explained anything. The owner's requirement, recorded in `docs/owner-content-direction.md`, is a headline **plus a short informative explanation** on every slide, delivered in the voice of a lecturer teaching students rather than a warning poster.

Research into educational carousel copy was performed via You.com and recorded in `docs/educational-carousel-copy-reference.md`, with each finding labelled by source class.

## Problem

1. **No field can hold an explanation.** The schema and the system prompt provide no structured place for teaching copy, so the model is never asked to explain. This is the direct cause of the owner's complaint.
2. **Source qualifiers are lost.** Slide 4 rendered `95% Bangunan Pakai Kolom Terikat`. The retrieved source says "hampir 95%" (approximately 95%). The qualifier and the attribution were dropped, presenting a figure as more definite than its source supports.
3. **Supporting reasoning is discarded.** The same source explains *why* tied columns dominate, in terms of tie spacing and shear failure. That reasoning could not reach the slide because no explanation field exists.
4. **Unverifiable figures can surface as headlines.** Slide 1 rendered `Tanpa Kolom, Gedung Runtuh dalam 3 Detik`. No stored research snippet contains that figure. Because snippets are excerpts rather than full pages, this is not proof of fabrication, but it must not be rendered as a factual claim without attribution.
5. **Framing is alarmist rather than explanatory.** Warning colours, debris, and exclamation icons dominated where the owner asked for labelled explanation.
6. **Direction language is inconsistent.** One slide's `Visual direction` was written in Indonesian while the others were in English.

## Solution

Replace the single short text field with a structured teaching block per slide, and constrain how factual content may be expressed.

### Per-slide fields

| Field | Purpose |
| --- | --- |
| `slide_title` | Short headline or question, understandable on its own |
| `slide_subtitle` | Optional one-line scope, condition, or consequence |
| `slide_explanation` | Short teaching explanation grounded in the approved research |
| `visual_labels` | Labels for the components, arrows, units, or stages shown |
| `slide_takeaway` | One concise transferable point |
| `on_image_text` | The primary short text rendered in the artwork |

Not every field renders on every slide. A diagram slide may use headline, labels, and one caption; a summary slide may use headline plus takeaways.

### Teaching behaviour

- The hook asks a precise question or exposes a mechanism the carousel actually explains. Unsupported fear language, superlatives, and absolutes are forbidden.
- Vocabulary is introduced before the mechanism that depends on it.
- Labels are placed near the components they identify, not in a separate legend.
- Every slide carries one teaching point and one dominant visual purpose.

### Factual expression

- A figure taken from a source keeps that source's qualifier. "hampir 95%" may not become "95%".
- A factual claim is accompanied by its scope or condition where the source supplies one.
- A claim absent from the approved research is omitted, not rendered as a headline.
- Invented numbers, dimensions, standards, project names, citations, handles, links, and lead magnets remain forbidden.

### Language

All generated direction fields are written in one consistent language per generation, so a slide cannot mix Indonesian and English direction while the audience-facing text stays Indonesian.

## Scope

### In Scope

- New columns on `prompt_slides` for the structured teaching fields.
- A revised synthesis and per-slide generation contract producing those fields.
- Provider templates emitting headline, explanation, labels, and takeaway as distinct labelled lines.
- Qualifier preservation and attribution rules for figures drawn from research.
- A rule that an unsupported claim is omitted rather than rendered.
- Consistent direction language across a generation.
- Tests for the new fields, the qualifier rule, and the omission rule.

### Out of Scope

- Changing the visual command catalog, the placement catalog, or the style lock contract. The narrative pattern applies identically to every visual command; only the leading token and the visual style differ.
- Slide-count changes, progress text, standalone-slide-2 rules, and soft CTA placement. Those belong to `carousel-narrative-structure`.
- Any promise about reach, engagement, saves, completion, or learning outcomes. The reviewed evidence does not support such promises, and one reviewed study found engagement gains without a matching comprehension gain.
- Encoding third-party word-count benchmarks as hard limits. The reviewed sources conflict, and no authoritative limit exists.
- Automatic fact verification against the live web at generation time.

## Success Criteria

- Every generated slide carries a headline and a short explanation.
- A figure that appears in a slide preserves the qualifier used by its source.
- A claim not present in the approved research does not appear as a slide headline or explanation.
- Provider prompts present headline, explanation, labels, and takeaway as separate labelled lines.
- Direction fields use one consistent language within a generation.
- Generated copy reads as explanation rather than alarm: no unsupported fear language, superlatives, or absolutes.

## Risks

- **Longer copy can overload a slide.** No authoritative text-density limit exists. Mitigation: adopt a testable production heuristic (headline roughly 3–10 words, explanation roughly 1–3 short sentences) and record it as a heuristic, not a standard.
- **A model may still drop a qualifier.** Mitigation: state the rule explicitly in the generation instruction and test the behaviour; do not claim the model is guaranteed to comply.
- **Omitting unsupported claims may leave a slide thin.** Mitigation: prefer a thinner accurate slide over an invented one; the owner reviews output before use.
- **More fields increase prompt length and cost.** Mitigation: keep fields short and bounded; reuse one style lock rather than regenerating aesthetics per slide.
