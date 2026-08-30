# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Synthesis Output
The system SHALL produce a structured per-slide teaching block with `slide_title`, `slide_subtitle`, `slide_explanation`, `visual_labels`, `slide_takeaway`, and `on_image_text`.

#### Scenario: Synthesis returns teaching fields
- GIVEN approved research and a post topic
- WHEN synthesis runs
- THEN each slide contains the six named fields
- AND `slide_title`, `slide_explanation`, and `on_image_text` are non-empty strings

#### Scenario: Synthesis keeps fields separate
- GIVEN synthesis output
- WHEN the prompt generator consumes it
- THEN explanation is passed separately from the primary on-image text
- AND visual labels are passed separately from prose explanation

### Requirement: Research-Grounded Explanation
The system SHALL derive factual slide explanation, labels, takeaways, and on-image text only from the owner topic and approved research sources.

#### Scenario: Source reasoning reaches the explanation
- GIVEN a source that states a qualified figure and explains its reason
- WHEN synthesis creates a slide about that figure
- THEN the explanation may include the qualified figure and source reasoning
- AND it does not drop the qualifier or add unsupported reasoning

#### Scenario: Unsupported claim is omitted
- GIVEN a claim or number absent from the approved research
- WHEN synthesis creates slide copy
- THEN it omits the claim from every teaching field
- AND it does not replace it with a plausible model-memory claim

#### Scenario: Citation or source scope is retained
- GIVEN a factual claim with a source, condition, or scope
- WHEN the claim is used in a slide
- THEN its source or scope is available to the downstream prompt as research context
- AND the prompt does not present an unqualified claim as universal

### Requirement: Lecturer-Like Teaching Voice
The system SHALL write concise, clear, plain-language explanations as if teaching the topic to students while preserving technical precision.

#### Scenario: Hook explains its promise
- GIVEN a hook slide
- WHEN it is generated
- THEN its headline invites a precise question or mechanism
- AND its explanation briefly states what the viewer will learn
- AND it does not use unsupported fear, sensationalism, or clickbait

#### Scenario: Problem points to the lesson
- GIVEN a problem slide
- WHEN it is generated
- THEN its explanation identifies the supported problem or misconception
- AND it connects that problem to the mechanism or evidence taught next

#### Scenario: Solution remains scoped
- GIVEN a solution slide
- WHEN it is generated
- THEN its explanation states the supported implication or takeaway
- AND it does not convert an example into a universal engineering rule

#### Scenario: CTA follows teaching
- GIVEN a CTA slide
- WHEN it is generated
- THEN its explanation or takeaway closes the lesson before the action request
- AND its on-image text requests one action only

### Requirement: Explanation Density Guard
The system SHOULD target a headline of roughly 3–10 words and a body explanation of 1–3 short sentences or roughly 15–40 words as a production heuristic, not as a universal limit.

#### Scenario: Dense content is split rather than invented
- GIVEN a mechanism or comparison that cannot be explained accurately within the heuristic
- WHEN synthesis runs
- THEN it may use additional slides or shorter supported statements
- AND it never removes a necessary condition or invents a replacement fact merely to meet the heuristic

### Requirement: Direction Language Consistency
The system SHALL use one configured direction language for all visual direction and teaching fields in a generation, while on-image audience text remains Indonesian.

#### Scenario: All direction fields use one language
- GIVEN a generation with five slides
- WHEN the prompts are built
- THEN visual direction and labels use one consistent language across all five slides

## MODIFIED Provider Prompt Requirements

### Requirement: Provider Prompt Content Separation
Each provider prompt SHALL present the teaching fields as separate labelled lines: headline, optional subtitle, explanation, visual labels, takeaway, and exact on-image text.

#### Scenario: GPT Image prompt contains the explanation
- GIVEN a generated GPT Image variant
- WHEN the prompt is inspected
- THEN it contains separate `Slide title`, `Slide explanation`, `Visual labels`, and `Slide takeaway` lines
- AND it starts with the selected visual command token

#### Scenario: All providers retain teaching content
- GIVEN a generated slide
- WHEN GPT Image, Nano Banana, and Recraft variants are built
- THEN all three contain the same factual teaching fields
- AND their provider-specific visual instructions remain distinct

## Fact-Fidelity Constraint

The existing research approval gate and fact-fidelity guard remain mandatory. The style lock, visual command, placement metadata, and copy heuristics may control presentation only; they may not add facts.
