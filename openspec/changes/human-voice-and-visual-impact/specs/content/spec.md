# Content Delta

## ADDED Requirements

### Requirement: Artwork Text Boundary
The system SHALL distinguish artwork text from teaching context in every generated provider prompt, and SHALL instruct that only artwork text is rendered in the image.

#### Scenario: Explanation is context, not body copy
- GIVEN a generated slide with `slide_explanation`
- WHEN a provider prompt is built
- THEN the explanation appears in a section labelled as composition context
- AND the prompt instructs that it must not be rendered as a paragraph in the artwork

#### Scenario: Primary artwork text stays explicit
- GIVEN a generated slide
- WHEN a provider prompt is built
- THEN the only primary rendered text is the exact `on_image_text`
- AND any additional rendered text is limited to explicitly approved labels

#### Scenario: Short explanatory phrase requires explicit placement
- GIVEN a slide whose explanation contains a phrase the owner wants visible
- WHEN the slide is generated
- THEN that phrase must be placed in `on_image_text` to be rendered
- AND it is not silently copied from the explanation field

### Requirement: Visual Impact in the Style Lock
The system SHALL require every generated style lock to specify a deliberate focal point, a high-contrast accent, and a readable display-typography hierarchy, while remaining aesthetic-only.

#### Scenario: Focal point is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it names one dominant focal element or entry point per slide

#### Scenario: Contrast accent is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it specifies one high-contrast accent colour against its base palette
- AND it does not expand the palette with additional decorative colours

#### Scenario: Display typography is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it specifies a bold display treatment for headings with a readable scale hierarchy

#### Scenario: Impact stays aesthetic-only
- GIVEN a generated style lock with impact requirements
- WHEN it is validated
- THEN it still contains no engineering facts, numbers, materials, dimensions, named methods, standards, or citations

### Requirement: Human Practitioner Voice
The system SHALL generate copy in a clear, relaxed Indonesian creator voice appropriate for civil engineering, construction, and architecture education, without inventing personal experience.

#### Scenario: Practical starting point
- GIVEN a hook slide
- WHEN copy is generated
- THEN it starts from a practical question or situation the learner recognises
- AND it does not open with a formal report phrase such as "Sumber menjelaskan bahwa"

#### Scenario: Friendly register
- GIVEN educational social copy
- WHEN it is generated
- THEN it addresses the reader as "kamu" unless an approved platform voice specifies otherwise
- AND it does not default to formal institutional register

#### Scenario: Natural Indonesian phrasing
- GIVEN generated copy
- WHEN it is inspected
- THEN it avoids literal translated-English phrasing
- AND it uses natural Indonesian connectors appropriate to the sentence

#### Scenario: Varied rhythm without mechanical randomness
- GIVEN generated copy
- WHEN it is inspected
- THEN sentence length varies naturally where emphasis calls for it
- AND it does not repeat the same three-item staccato list pattern across slides

#### Scenario: Repeated template patterns are discouraged
- GIVEN a generated carousel
- WHEN its copy is inspected
- THEN it does not repeat the "bukan sekadar X, tetapi Y" construction across slides
- AND it does not make every heading a question when the content does not call for it

#### Scenario: No invented experience
- GIVEN copy generation
- WHEN the owner has supplied no personal experience
- THEN the copy does not claim first-person experience
- AND it uses an observed case, documented example, or clearly labelled hypothetical instead

#### Scenario: No detector evasion
- GIVEN copy generation
- WHEN prompts are built
- THEN no instruction targets AI-text-detector avoidance
- AND detector scores are not used as a quality metric

## Constraint

Fact fidelity outranks voice. A more natural sentence must never introduce an unsupported claim, drop a source qualifier, or blur a condition that the source states.
