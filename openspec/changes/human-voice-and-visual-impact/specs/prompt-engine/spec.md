# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Provider Prompt Structure
Each provider prompt SHALL separate artwork text from composition context using labelled sections.

#### Scenario: Labelled render section
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it contains a section that names the exact text to render in the artwork

#### Scenario: Labelled context section
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it contains a section labelled as composition context only
- AND that section holds the subtitle, explanation, takeaway, and research context

#### Scenario: Context is excluded from rendering
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it instructs that context text must not be rendered as body copy or a paragraph block

#### Scenario: Existing guarantees are preserved
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN the GPT Image variant still begins with the selected visual command token
- AND the verbatim style lock, target canvas, exact-text rule, and exclusions block are unchanged

### Requirement: Style Lock Generation Brief
The style-lock generation instruction SHALL require a focal point, one high-contrast accent, and a bold display-typography hierarchy, and SHALL keep the output aesthetic-only.

#### Scenario: Impact requirements are instructed
- GIVEN the style-lock generation instruction
- WHEN it is built
- THEN it requires a dominant focal element, one high-contrast accent, and a display-type hierarchy

#### Scenario: Clutter is excluded
- GIVEN the style-lock generation instruction
- WHEN it is built
- THEN it forbids decorative clutter, palette expansion beyond the specified accent, and unrequested interface elements

#### Scenario: Aesthetic-only guard still applies
- GIVEN a generated style lock
- WHEN it is validated
- THEN the existing aesthetic-only check still rejects units, standards, prices, and durations

### Requirement: Voice Instructions in Copy Generation
The synthesis and visual-note instructions SHALL state the creator-voice rules, the discouraged patterns, and the no-invented-experience rule.

#### Scenario: Voice rules present in synthesis
- GIVEN the synthesis instruction
- WHEN it is built
- THEN it states the relaxed Indonesian creator voice, the "kamu" default, and natural connector guidance

#### Scenario: Discouraged patterns are named
- GIVEN the synthesis instruction
- WHEN it is built
- THEN it names the formulaic attribution, repeated three-item list, repeated question-heading, and "bukan sekadar X" patterns as things to avoid

#### Scenario: No invented experience instruction
- GIVEN the synthesis instruction
- WHEN it is built
- THEN it forbids claiming first-person experience the owner did not supply

#### Scenario: On-image text stays short and exact
- GIVEN the visual-note instruction
- WHEN it is built
- THEN it requires `on_image_text` to remain short enough to render legibly
- AND it requires the text to agree with the slide's teaching copy without copying the whole explanation

## Constraint

No requirement in this change may instruct a model to evade AI-text detection, may assert that a provider will obey a render boundary, or may permit voice changes that weaken fact fidelity or drop a source qualifier.
