# Educational Carousel Copy Reference

> Research performed via You.com on 2026-08-30. This document records evidence boundaries
> and product guidance; it is not a source of engineering facts.

## Diagnosis of the current sample

Verified against the ten stored rows in `post_research_sources` for post `29a569ec` ("Kegunaan Kolom Bangunan") on 2026-08-30.

The sample prompt contains only `On-image text`, not a separate explanation/body field. The current `SYSTEM_PROMPT` also describes `on_image_text` as a short key phrase and forbids a full sentence. Therefore the generator has no structured place to create the lecturer-like explanation the owner wants.

### The research was used, and it is traceable

`95% Bangunan Pakai Kolom Terikat` on slide 4 **is grounded in an approved research source**. A stored snippet from https://stellamariscollege.org/jenis-kolom/ reads:

> "Biasanya, jika jarak ikatan itu berjauhan maka kolom itu pasti akan mengalami keruntuhan geser dan akan mengarah kepada area ikatan. Itulah mengapa hampir 95% semua bangunan itu sudah memakai kolom terikat."

So the fact-fidelity path worked: a figure in the output can be traced to a real retrieved source. The You.com research stage is doing its job and its output is being consumed.

### Two presentation faults, not a research failure

1. **A qualifier was dropped.** The source says "hampir 95%" (approximately 95%). The slide states a bare "95%" with no qualifier and no attribution. This is precisely the failure mode the reviewed data-visualisation guidance warns about: presenting a figure as more definite than its source supports.
2. **The supporting reasoning was discarded.** The same snippet explains _why_ tied columns dominate — tie spacing and shear failure. That explanation could not survive into the slide because the only text field available is an 80-character key phrase. The number passed through; the teaching did not.

### One claim that could not be verified either way

`Tanpa Kolom, Gedung Runtuh dalam 3 Detik` on slide 1: no stored title or snippet contains a "3 detik" or "3 second" figure. Two snippets do mention `runtuh`/collapse, but none states a collapse duration.

Stored snippets are excerpts, not full page text, so this is **not** proof that the figure was fabricated. The accurate statement is: the figure is not present in the retrieved evidence available to the system, and therefore must not be rendered as a factual claim without attribution.

### Framing

The sample uses alarmist framing (warning colours, debris, exclamation symbols) where the requested delivery is explanatory. The visual direction is inconsistent in language, and the style lock was collapsed into one long line rather than six labelled lines.

## Evidence classification

### ACADEMIC/PEER-REVIEWED

- Pair words with purposeful visuals. Irrelevant words, decoration, and excessive visual detail add extraneous processing. Sources: https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197 and https://pubmed.ncbi.nlm.nih.gov/23488757/
- Signaling such as arrows, highlights, contrast, numbering, and callouts can direct attention to pictorial information. Sources: https://pubmed.ncbi.nlm.nih.gov/33536969/ and https://pubmed.ncbi.nlm.nih.gov/35969528/
- Pre-training important vocabulary before a complex mechanism and progressively revealing complexity are supported instructional principles. Sources: https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197 and https://www.sciencedirect.com/science/article/abs/pii/S2211368121000231
- Engagement improvement does not prove conceptual-learning improvement; the reported lecture study found signaling/segmenting/embodiment effects without an associated quiz-score improvement. Source: https://pubmed.ncbi.nlm.nih.gov/35969528/

### UNIVERSITY/EDUCATIONAL and INFORMATION-DESIGN ESTABLISHED

- Use descriptive headings, define technical terms and acronyms at first use, label visuals close to the component, and state the takeaway in plain language. Sources: https://engineering.purdue.edu/ERG/guide/General%20Info, https://thelearningoak.com/index.php/2018/05/13/what_does_research_say_label_explain_a_diagram/, and https://ies.ed.gov/rel-central/2025/01/data-visualization-checklist
- For data visuals, labels, scales, metadata, and sources must be accurate; a visual must not imply a conclusion unsupported by its data. Source: https://ies.ed.gov/rel-central/2025/01/data-visualization-checklist
- A useful teaching progression is hook/question → context → problem or misconception → terms and parts → mechanism → evidence/example → solution/design implication → summary → CTA. This is an adaptation of instructional principles, not a universally validated carousel formula.
- A standalone slide should identify the topic, its own point, what the visual shows, and its relationship to the lesson. Do not begin with a grammatical continuation such as "as we saw" without restating the subject.

### PLATFORM/ACCESSIBILITY OFFICIAL

- WCAG documents a 4.5:1 minimum contrast ratio for normal text and 3:1 for large text. Source: https://www.w3.org/TR/wcag2mobile-22/
- WCAG requires resize support to 200%, with exceptions including text embedded in images. Source: https://www.w3.org/TR/WCAG22/
- WCAG does not specify a universal word, character, line, font-size, or seconds-to-read limit for an Instagram carousel. Sources: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/TR/wcag2mobile-22/
- Sufficient contrast and resizing compliance do not guarantee that text embedded in a compressed social image is comfortable to read on every device. Source: https://www.w3.org/TR/mobile-accessibility-mapping/

### THIRD-PARTY MARKETING HEURISTIC

- Conflicting production heuristics suggest roughly 15–30, 30–40, or 30–50 words per slide; headline ranges around 5–8 words; and short body copy. These are not universal standards. Sources: https://postnitro.ai/blog/post/carousel-copywriting-framework, https://www.attentionclaw.com/blog/structured-content-engines, https://mcpmarket.com/tools/skills/social-media-carousel-designer, https://adaptlypost.com/en/blog/text-overlays-on-instagram-carousels, https://www.blotato.com/blog/claude-prompts-social-media, and https://futuristicmarketingservices.com/Blogs/graphic-designing/instagram-carousel-design-guide/
- A safe initial production heuristic for this product is headline 3–10 words, subheadline one short phrase, body 1–3 short sentences or approximately 15–40 words, one teaching point, and one dominant visual. This is a testable heuristic, not a hard limit.
- For a dense calculation, comparison, or worked example, split the explanation, enlarge it, simplify it, or move detail to the caption rather than forcing an arbitrary word limit.

## Recommended content contract

Each generated slide should have separate structured fields:

```text
slide_title: short headline or question
slide_subtitle: optional one-line scope or consequence
slide_explanation: short teaching explanation, grounded in approved sources
visual_labels: labels for the components, arrows, units, or stages shown
slide_takeaway: one concise sentence or principle
on_image_text: primary short text rendered in the artwork
```

Not every field must render on every slide. A diagram may use headline + labels + one caption; a summary may use headline + three takeaways. The separation is needed so the model can explain without turning the primary headline into a paragraph.

## Recommended teaching behavior

- Hook: ask a precise question or expose a mechanism the carousel will actually explain. Avoid unsupported fear, superlatives, absolutes, and invented time or percentage claims.
- Context slide: repeat the topic marker and define the key object or term so the slide works independently.
- Problem/misconception: state what is unclear or commonly misunderstood only when the source packet supports it; distinguish risk, possibility, observed failure, and confirmed cause.
- Terms/parts: introduce vocabulary before the complex mechanism; place labels near the components they identify.
- Mechanism/data: show one relationship or one worked point, with arrows/callouts whose meaning is explained; include source and conditions for factual data.
- Solution/design implication: state what the supplied evidence supports. Do not turn an example into a universal engineering rule.
- Summary: give two or three transferable points only if the sources support them.
- CTA: ask for one action. Save is coherent for reference material; follow is coherent for a continuing teaching series; a question/comment is coherent when the post genuinely invites an assumption or next case. The evidence does not prove that one CTA performs best.

## Prompt constraints required for a future implementation

- State audience, prerequisites, and one learning objective before generating slide copy.
- Use only the approved research packet and owner topic for factual content.
- Attach a source to every statistic, standard, date, threshold, causal claim, or technical requirement.
- Distinguish fact, interpretation, example, assumption, and recommendation.
- State scope, units, conditions, exceptions, and uncertainty where supplied by the source.
- Define technical terms and acronyms at first use.
- Require one teaching point and one dominant visual purpose per slide.
- Require slide 2 to stand alone.
- Require a calm curiosity hook that does not use unsupported fear language, superlatives, or clickbait.
- Forbid invented numbers, prices, dimensions, standards, project names, quotations, citations, handles, links, and lead magnets.
- If a claim is unsupported, omit it or mark it `[VERIFY]`; do not complete it from model memory.
- Include an expert-review checklist; never present fluent output as automatically correct engineering advice.

## Not supported by the evidence

- No universal text-density limit for mobile carousel images.
- No proof that a particular hook formula, CTA, slide count, or word count maximizes reach, engagement, saves, or learning for civil-engineering, construction, architecture, or STEM audiences.
- No proof that engagement improvements imply conceptual understanding.
- No permission to copy benchmark figures or marketing claims into generated engineering content.
