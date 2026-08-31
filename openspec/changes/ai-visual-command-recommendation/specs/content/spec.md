# Content Delta

## ADDED Requirements

### Requirement: Command Recommendation Source
The system SHALL provide a recommendation service that maps a post's topic and approved research brief to visual commands from the approved catalog, with reasons grounded in the topic or research.

#### Scenario: Recommendation is grounded in the topic
- GIVEN a post with a topic and an approved research brief
- WHEN the owner requests a recommendation
- THEN the service returns a primary command with a reason that references the topic or the research brief

#### Scenario: Recommendation uses only the catalog
- GIVEN a recommendation response
- WHEN it is inspected
- THEN every returned command value exists in `src/lib/catalog/visualCommands.ts`
- AND no value outside the catalog is accepted

#### Scenario: Reason must not introduce new facts
- GIVEN a recommendation reason
- WHEN it is inspected
- THEN it refers to the topic or the research brief
- AND it does not contain a new engineering fact, number, material property, dimension, standard, duration, or claim not present in the supplied inputs

#### Scenario: Recommendation failure is visible
- GIVEN the model returns a command outside the catalog
- WHEN the response is parsed
- THEN the system rejects it with a clear error
- AND no fallback command is applied silently

### Requirement: Recommendation Is Advisory Only
A recommendation SHALL not change any stored post data. The owner's manual selection remains authoritative.

#### Scenario: Owner ignores the recommendation
- GIVEN a post with a stored visual command and a recommendation
- WHEN the owner does not act on the recommendation
- THEN the stored visual command remains unchanged
- AND generation proceeds with the owner's selection

#### Scenario: Owner accepts the primary recommendation
- GIVEN a recommendation with a primary command
- WHEN the owner chooses to apply it
- THEN the post's visual command is updated to the recommended value
- AND the owner remains free to change it again before generation

### Requirement: Per-Slide Command Plan
The recommendation service MAY return an optional per-slide plan assigning one catalog command per slide index, each with a reason.

#### Scenario: Per-slide plan is optional
- GIVEN a recommendation response
- WHEN it is inspected
- THEN the per-slide plan field is present or absent without causing a parse error

#### Scenario: Per-slide plan contains valid commands
- GIVEN a per-slide plan is present
- WHEN it is inspected
- THEN each slide's command value exists in the catalog
- AND each slide has a reason grounded in the topic or research

#### Scenario: Per-slide plan does not overwrite the post
- GIVEN a per-slide plan is returned
- WHEN the owner does not act on it
- THEN the per-slide plan is stored for reference only
- AND generation still uses the single stored visual command

### Requirement: Recommendation Persistence
Each recommendation SHALL be stored so the owner can revisit it without a new model call.

#### Scenario: Recommendation is stored with metadata
- GIVEN a recommendation is generated
- WHEN it is persisted
- THEN it records the model used, the topic, and the timestamp
- AND it records the primary command, reasons, alternatives, and per-slide plan

#### Scenario: Recommendation is retrievable
- GIVEN a stored recommendation exists for a post
- WHEN the owner opens the generate or review page
- THEN the recommendation is displayed from storage
- AND no new model call is made

## Constraint

The recommendation concerns visual form only. It must not be used to add, rewrite, or amplify the article's factual content. Fact fidelity remains controlled by the synthesis and prompt-generation stages.
