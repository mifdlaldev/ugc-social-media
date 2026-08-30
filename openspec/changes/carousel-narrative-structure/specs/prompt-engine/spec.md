# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Per-Slide Type and Order
The system SHALL assign slide roles so that the first slide is a hook, the second slide is a standalone context hook, middle slides each carry one self-contained idea, and the final slide is a single-action call to action.

#### Scenario: First slide is the hook
- GIVEN a post with slide_count=7
- WHEN the generator produces slides
- THEN slide_index=0 has slide_type=hook

#### Scenario: Second slide stands alone
- GIVEN a post with any supported slide count
- WHEN the generator produces slides
- THEN slide_index=1 is comprehensible without slide_index=0
- AND it does not begin as a grammatical continuation of the first slide

#### Scenario: Middle slides are self-contained
- GIVEN a post with slide_count=10
- WHEN the generator produces the middle slides
- THEN each middle slide conveys one idea that makes sense without its neighbours

#### Scenario: Final slide is the call to action
- GIVEN a post with any supported slide count
- WHEN the generator produces slides
- THEN the last slide has slide_type=cta

## ADDED Requirements

### Requirement: Single-Action Final CTA
The system SHALL request exactly one viewer action on the final slide.

#### Scenario: One action only
- GIVEN a generated final slide
- WHEN its on-image text is inspected
- THEN it asks for exactly one action
- AND it does not combine save, follow, comment, and link actions in one slide

### Requirement: Mid-Carousel Soft Save Prompt
The system SHALL place one soft save prompt in a middle or summary slide, and SHALL NOT let it replace the final call to action.

#### Scenario: Soft prompt appears once
- GIVEN a post with slide_count=10
- WHEN slides are generated
- THEN exactly one middle or summary slide carries a soft save prompt

#### Scenario: Soft prompt does not replace the final CTA
- GIVEN a post whose middle slide carries a soft save prompt
- WHEN the final slide is generated
- THEN the final slide still carries its own single-action call to action

#### Scenario: Short carousel still separates the two
- GIVEN a post with slide_count=5
- WHEN slides are generated
- THEN the soft save prompt appears before the final slide
- AND the final slide remains a distinct single-action call to action

### Requirement: Deliberate Progress Text
The system SHALL instruct that each slide render exact progress text in the form `N/M`, where `N` is the one-based slide number and `M` is the total slide count.

#### Scenario: Progress text is exact
- GIVEN slide 2 of a 7-slide post
- WHEN the prompt is built
- THEN it instructs rendering the exact text `2/7`

#### Scenario: Progress text is distinguished from interface decoration
- GIVEN any generated slide prompt
- WHEN it is inspected
- THEN the progress text is requested as small artwork typography
- AND the prompt still excludes carousel dot indicators, swipe arrows, page chrome, and application or browser interface

#### Scenario: Progress text is not presented as guaranteed
- GIVEN a generated prompt containing progress text
- WHEN it is inspected
- THEN the text is expressed as an instruction
- AND no text claims the provider will render it correctly

## Constraint

No requirement in this change may assert a reach, engagement, save, swipe-through, or completion-rate outcome, and no third-party benchmark figure may be encoded in product behavior or emitted into prompt content. The researched sources are recorded in `docs/carousel-structure-reference.md` and are predominantly third-party.
