# Prompt Engine Delta

## ADDED Requirements

### Requirement: Recommendation JSON Contract
The recommendation model call SHALL request a strict JSON object with catalog-constrained command values.

#### Scenario: Valid recommendation response
- GIVEN the model returns valid JSON
- WHEN it contains a primary command from the catalog, at most two alternatives, and optional valid per-slide entries
- THEN the service parses and returns the recommendation

#### Scenario: Unknown command is rejected
- GIVEN any primary, alternative, or per-slide command value is not in the catalog
- WHEN the response is parsed
- THEN the service throws a stable recommendation validation error
- AND it does not replace the value with `/infographic` or another default

#### Scenario: Malformed response is rejected
- GIVEN the model returns prose, malformed JSON, or missing required fields
- WHEN the response is parsed
- THEN the service throws a stable recommendation parsing error
- AND it does not return an empty recommendation

### Requirement: Grounded Recommendation Instruction
The recommendation system prompt SHALL restrict reasons to visual-form reasoning grounded in supplied inputs.

#### Scenario: A-versus-B topic
- GIVEN a topic that explicitly compares two subjects
- WHEN the model recommends a command
- THEN the instruction permits `/comparison` when that value exists in the catalog
- AND the reason explains the side-by-side visual fit without adding a subject-matter claim

#### Scenario: Multi-point topic
- GIVEN a topic whose supplied inputs contain multiple independent points or data items
- WHEN the model recommends a command
- THEN the instruction permits `/infographic` or another catalog command when visually appropriate
- AND the reason stays about how the form organizes the supplied content

#### Scenario: Internal structure topic
- GIVEN a topic whose supplied inputs require showing internal parts or layers
- WHEN the model recommends a command
- THEN the instruction may select `/cutaway`, `/crosssection`, `/anatomy`, `/layers`, or `/explodedview` only when supported by the catalog description and supplied topic

#### Scenario: No unsupported certainty
- GIVEN a recommendation
- WHEN the reason is generated
- THEN it does not claim the command will produce a better image, higher engagement, higher comprehension, or provider compliance

### Requirement: Existing Generation Contract Preserved
Recommendation SHALL be advisory and separate from existing generation inputs.

#### Scenario: Generation without recommendation
- GIVEN a post with no recommendation
- WHEN generation runs
- THEN the existing stored visual command, style lock, placement, teaching fields, and provider templates behave unchanged

#### Scenario: Recommendation does not alter provider prompt
- GIVEN a recommendation that the owner has not applied
- WHEN a provider prompt is built
- THEN the prompt uses the owner's stored visual command
- AND the recommendation text is not inserted as hidden direction
