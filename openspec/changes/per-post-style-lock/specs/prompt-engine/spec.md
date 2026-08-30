# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Prompt Generation Pipeline
The system SHALL insert the post's stored style lock verbatim into every generated slide prompt, and SHALL vary only per-slide content between slides.

#### Scenario: Style lock is byte-identical across slides
- GIVEN a post with a stored style lock and slide_count=5
- WHEN slides are generated
- THEN every generated prompt contains the style lock text exactly as stored
- AND the style lock text is not paraphrased, summarised, or reordered

#### Scenario: Per-slide content still varies
- GIVEN a post with a stored style lock
- WHEN slides are generated
- THEN each slide may differ in subject, composition, focal point, visual metaphor, and on-image text
- AND the locked aesthetic properties do not differ between slides

#### Scenario: Style lock adds no facts
- GIVEN a post whose approved research omits a dimension
- WHEN prompts are generated with a style lock
- THEN no dimension is introduced by the style lock
- AND factual content still originates only from the approved research and the owner topic

### Requirement: Provider Prompt Separation
The system SHALL emit the selected visual command as the first token of the GPT Image variant prompt while retaining the existing labelled visual-form line, and SHALL keep the other providers' formats distinct.

#### Scenario: GPT Image variant leads with the command
- GIVEN a post with visual_command=/infographic
- WHEN the GPT Image variant is built
- THEN the prompt text begins with `/infographic`
- AND the prompt also contains a labelled visual-form line naming the same command

#### Scenario: Command token is not presented as a provider API command
- GIVEN any generated prompt containing a leading command token
- WHEN the prompt is inspected
- THEN the token appears as a prompt-writing convention
- AND no text asserts that the provider implements it as a native command

#### Scenario: Other providers keep their formats
- GIVEN a post with any visual command
- WHEN the Nano Banana and Recraft variants are built
- THEN each retains its own existing provider-specific direction
- AND each carries the same style lock and target canvas

### Requirement: Prompt Exclusions
The system SHALL include an explicit exclusions block in every generated slide prompt.

#### Scenario: Interface and decoration are excluded
- GIVEN any generated slide prompt
- WHEN it is inspected
- THEN it excludes carousel dot indicators, page indicators, swipe arrows, application or browser interface, device frames, decorative borders, and frames

#### Scenario: Marks and placeholders are excluded
- GIVEN any generated slide prompt
- WHEN it is inspected
- THEN it excludes watermarks, logos, signatures, QR codes, and placeholder text

#### Scenario: Exclusions are not presented as guarantees
- GIVEN a generated prompt containing exclusions
- WHEN it is inspected
- THEN the exclusions are expressed as instructions
- AND no text claims the provider is guaranteed to obey them

### Requirement: Exact On-Image Text
The system SHALL mark on-image text as exact and SHALL instruct that no additional text be rendered.

#### Scenario: On-image text is marked exact
- GIVEN a slide with on-image text
- WHEN the prompt is built
- THEN the text appears quoted and marked as exact and verbatim
- AND the prompt instructs that no extra characters or additional text be added

#### Scenario: Indonesian text is preserved as written
- GIVEN a slide whose on-image text is Indonesian
- WHEN the prompt is built
- THEN the prompt instructs that the text be rendered exactly as supplied
- AND it does not instruct translation, paraphrase, or transliteration

## Constraint

No requirement in this change may depend on a `seed` parameter, on reference-image inputs, or on any assertion that an external provider guarantees style consistency, exact pixel output, or exact text rendering. The cited official guidance does not support such guarantees.
