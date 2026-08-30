# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Prompt Generation Pipeline
The system SHALL use the post's selected `visual_command` as an explicit visual-direction input when generating every slide and provider variant.

#### Scenario: Selected command reaches every provider variant
- GIVEN an approved post with visual_command=/blueprint
- WHEN the owner triggers generation
- THEN every generated slide variant contains blueprint-oriented visual direction
- AND provider-specific formatting remains separate from the visual command

#### Scenario: Visual command does not replace research grounding
- GIVEN an approved post with visual_command=/comparison and approved research
- WHEN prompts are generated
- THEN the comparison direction is applied to composition
- AND factual values and claims come only from the approved research and topic

### Requirement: Provider Prompt Separation
The system SHALL preserve distinct provider variants while applying the same selected visual command to each provider variant.

#### Scenario: GPT Image variant
- GIVEN a post with visual_command=/infographic
- WHEN a GPT Image variant is built
- THEN it includes the selected infographic direction and the provider's verified text-rendering instructions

#### Scenario: Nano Banana variant
- GIVEN a post with visual_command=/isometric
- WHEN a Nano Banana variant is built
- THEN it includes the selected isometric direction and the provider's verified visual-heavy instructions

#### Scenario: Recraft variant
- GIVEN a post with visual_command=/diagram
- WHEN a Recraft variant is built
- THEN it includes the selected diagram direction and the provider's verified vector-style instructions

### Requirement: Visual Command Fidelity
The system MUST NOT treat a slash command as a native image-provider API command or claim that a provider supports a command syntax unless separately verified.

#### Scenario: Slash command is rendered as direction
- GIVEN a post with visual_command=/crosssection
- WHEN a prompt is generated
- THEN the prompt expresses the catalog meaning as natural-language visual direction
- AND it does not claim that `/crosssection` is a native provider command

#### Scenario: Unknown command cannot reach generation
- GIVEN a post payload containing a command outside the approved eighteen values
- WHEN generation is requested
- THEN the request is rejected before prompt construction

### Requirement: Fact Fidelity
The system SHALL continue to apply the existing research/topic fact-fidelity rules after adding visual command direction.

#### Scenario: No fact injection from a command
- GIVEN a post with visual_command=/anatomy and research that omits dimensions
- WHEN the prompt is generated
- THEN the prompt does not invent dimensions
- AND the absence is represented according to the existing fidelity behavior

## Scope Boundary

This change does not add a short/detail selector. The detailed prompt examples in the owner catalog remain reference material until a separate approved requirement defines how they are selected and persisted.
