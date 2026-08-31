# Design: Human Voice and Visual Impact

## Decision Summary

Fix three defects observed in the owner's second test without adding new database fields:

1. Provider prompts must separate artwork text from composition context, because the image model rendered `slide_explanation` as a paragraph.
2. Style-lock generation must require a focal point, one high-contrast accent, and bold display typography, because the generated lock chose a muted low-impact palette.
3. Copy generation must use a human creator voice and avoid template patterns, because the output read as report boilerplate.

Evidence is recorded in `docs/educational-carousel-copy-reference.md` and `docs/owner-content-direction.md`. Peer-reviewed findings, style guidance, and marketing opinion are labelled separately there.

## Render Boundary

Restructure the provider templates so each prompt has two labelled sections.

```text
RENDER IN ARTWORK — EXACT TEXT ONLY:
"<on_image_text>"
Visual labels to render: <visual_labels>      (omitted when empty)

CONTEXT FOR COMPOSITION ONLY — DO NOT RENDER AS BODY COPY:
Slide title: ...
Slide subtitle: ...                            (omitted when empty)
Slide explanation: ...
Slide takeaway: ...                            (omitted when empty)
Research context: ...
```

The exclusions block gains one entry: no paragraph of body copy, and no rendering of the context section.

`slide_title` moves into the context section. It is the editorial headline; the text that actually appears in the artwork is `on_image_text`, which the visual-note stage already derives from the title and explanation. This removes the ambiguity that produced document-like slides.

This is prompt direction, not a compliance guarantee. OpenAI's own documentation states the model may struggle with text placement, so no requirement may assert obedience.

## Style Lock Impact Brief

Extend the style-lock system prompt with an impact section that stays aesthetic-only:

- one dominant focal element or visual entry point per slide;
- exactly one high-contrast accent against the base, named as a colour;
- bold display treatment for headings with a stated scale hierarchy;
- deliberate compositional contrast suited to the selected visual command;
- generous safe space so text is never crowded;
- explicit prohibition on palette expansion, decorative clutter, and interface ornament.

The existing `assertAestheticOnly` guard is unchanged and still rejects units, standards, prices, and durations. Impact wording must not introduce a factual claim.

Per-post variation is preserved. The requirement is a deliberate hierarchy, not one permanent brand palette.

## Voice Instructions

Extend the synthesis instruction with a voice block:

- write as a practitioner explaining a practical point to students;
- address the reader as `kamu` for educational social copy;
- open from a recognisable situation or question rather than a report phrase;
- vary sentence length where emphasis calls for it, without mechanical alternation;
- prefer natural Indonesian connectors (`karena`, `soalnya`, `jadi`, `tapi`, `padahal`, `misalnya`, `biasanya`) over defaulting to `selain itu` or `dengan demikian` for every transition;
- avoid literal translated-English phrasing;
- define jargon at first use.

Discouraged patterns, stated as patterns rather than a word blacklist:

- formulaic attribution such as `Sumber menjelaskan bahwa` or `studi menunjukkan` without a named supplied source and a specific claim;
- repeated three-item staccato lists;
- every heading shaped as a question;
- the `bukan sekadar X, tetapi Y` construction repeated across slides;
- excessive em dashes.

Two hard rules:

- **No invented experience.** First-person experience is allowed only when the owner supplied it. Otherwise use an observed case, a documented example, or a clearly labelled hypothetical.
- **No detector evasion.** No instruction may target AI-text-detector avoidance. Reviewed research found detectors misclassify a large share of non-native writing, so a detector score is not a quality metric.

Fact fidelity outranks voice. Qualifier preservation and omission of unsupported claims stay above style in priority.

## Ordering Within the Prompt

Section order for the GPT Image variant:

1. leading visual command token;
2. artifact and placement;
3. `RENDER IN ARTWORK` section;
4. visual direction;
5. target canvas;
6. verbatim style lock;
7. `CONTEXT FOR COMPOSITION ONLY` section;
8. exact-text rule;
9. exclusions block, including the new no-body-copy entry;
10. provider-specific finishing instructions.

Nano Banana and Recraft keep their own finishing instructions and receive the same sections. Ordering is a template decision; the research found no official statement that earlier tokens carry more weight.

## Testing

- Every provider prompt contains both labelled sections.
- The explanation appears only inside the context section.
- The exclusions block contains the no-body-copy entry.
- `on_image_text` remains the only quoted primary artwork text.
- The style-lock instruction contains the focal-point, accent, and display-typography requirements.
- The synthesis instruction contains the voice rules, the discouraged-pattern list, and the no-invented-experience rule.
- Existing guarantees still hold: leading command token, verbatim style lock, canvas and ratio, exact-text rule, exclusions, and the aesthetic-only guard.
- No source file contains a detector-evasion instruction.

Run `bun run check`, `bun test --run`, `bun run lint`, `openspec validate human-voice-and-visual-impact`, and the pipeline smoke test.

## Explicit Non-Decisions

- No new database column.
- No change to the visual command or placement catalogs.
- No change to slide count, standalone slide 2, CTA sequencing, or progress text.
- No invented biography, jobsite anecdote, measurement, project, or source.
- No detector-evasion instruction.
- No claim that a provider will obey render boundaries, style instructions, exclusions, or text rules.
