# Content Delta

## ADDED Requirements

### Requirement: Structured Teaching Fields Per Slide
The system SHALL store, for every generated slide, a headline, an optional subtitle, a teaching explanation, visual labels, and a takeaway, in addition to the primary on-image text.

#### Scenario: Every slide carries a headline and an explanation
- GIVEN a post with approved research and a stored style lock
- WHEN slides are generated
- THEN every slide has a non-empty headline
- AND every slide has a non-empty teaching explanation

#### Scenario: Optional fields may be absent
- GIVEN a generated diagram slide
- WHEN its stored fields are inspected
- THEN a subtitle may be absent
- AND the slide remains valid with a headline, labels, and an explanation

#### Scenario: Fields are stored separately
- GIVEN a generated slide
- WHEN its stored record is inspected
- THEN the headline, explanation, labels, and takeaway are separate values
- AND the explanation is not concatenated into the on-image text

### Requirement: Explanatory Voice
The system SHALL generate slide copy that explains the topic, and SHALL NOT use unsupported fear language, superlatives, or absolute claims.

#### Scenario: Hook invites and previews
- GIVEN a post whose research supports a mechanism
- WHEN the hook slide is generated
- THEN its headline asks a precise question or names the mechanism the carousel explains
- AND its explanation previews what the following slides will teach

#### Scenario: Alarmist framing is rejected
- GIVEN any generated slide
- WHEN its copy is inspected
- THEN it does not assert an unsupported consequence, superlative, or absolute such as always, never, or guaranteed collapse

#### Scenario: Terms are introduced before they are used
- GIVEN a carousel that explains a mechanism depending on a technical term
- WHEN slides are generated
- THEN the term is introduced before the slide that relies on it

### Requirement: Qualifier and Attribution Fidelity
The system SHALL preserve the qualifier a source applies to a figure, and SHALL NOT present an approximate figure as exact.

#### Scenario: Approximate figure keeps its qualifier
- GIVEN an approved research snippet stating "hampir 95% semua bangunan itu sudah memakai kolom terikat"
- WHEN a slide presents that figure
- THEN the slide expresses it as approximate
- AND it does not state a bare "95%"

#### Scenario: Condition is carried with the claim
- GIVEN an approved source that states a condition alongside a figure
- WHEN the figure appears in a slide
- THEN the stated condition or scope accompanies it

#### Scenario: Unsupported figure is omitted
- GIVEN a figure that appears in no approved research source
- WHEN slides are generated
- THEN the figure does not appear as a headline, explanation, or on-image text

#### Scenario: Reasoning is preserved when the source supplies it
- GIVEN an approved source that explains why a figure holds
- WHEN the figure appears in a slide
- THEN the slide's explanation may carry that reasoning
- AND the reasoning is not invented beyond the source

### Requirement: Consistent Direction Language
The system SHALL write all generated direction fields of one generation in a single language.

#### Scenario: Direction language does not vary between slides
- GIVEN a post generating five slides
- WHEN the visual direction fields are inspected
- THEN all five use the same language

#### Scenario: Audience text stays Indonesian
- GIVEN any generated slide
- WHEN its on-image text is inspected
- THEN it is Indonesian regardless of the direction language

## REMOVED Requirements

### Requirement: Key-Phrase-Only Slide Text (REMOVED)
The constraint that a slide's rendered text must be a short key phrase and must not be a full sentence is REMOVED. It left no structured place for a teaching explanation, which was the direct cause of uninformative output.

#### Scenario: A slide may carry a sentence
- GIVEN a generated slide
- WHEN its explanation is inspected
- THEN it may contain one or more complete sentences
