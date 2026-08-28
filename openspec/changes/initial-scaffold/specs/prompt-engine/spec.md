# Prompt Engine Delta

## Purpose
Convert an owner's educational article into structured, copy-ready image-generation prompt blocks using a text LLM through OpenRouter, deriving all factual content solely from the supplied article.

## ADDED Requirements

### Requirement: Article-Only Prompt Generation
The system SHALL generate prompt blocks whose factual claims are derived solely from the supplied article, and MUST NOT introduce facts from external sources, model memory, or web search.

#### Scenario: Generate from an article
- GIVEN an authenticated owner and a post with article content
- WHEN the owner requests prompt generation
- THEN the system returns structured prompt blocks derived from that article

#### Scenario: Missing fact is not invented
- GIVEN an article that does not specify a fact needed for a block
- WHEN prompt generation runs
- THEN the output marks that information as unspecified or omits it
- AND the output does not contain an invented value

#### Scenario: No external facts injected
- GIVEN any article
- WHEN prompt generation runs
- THEN no engineering fact absent from the article appears in the output

### Requirement: Structured Prompt Block Output
The system SHALL return prompt output matching the prompt block schema defined in DESIGN.md, including visual style, composition, color palette, typography, layout, on-image text, aspect ratio, and per-tool notes.

#### Scenario: Output conforms to schema
- GIVEN a successful generation
- WHEN the result is returned
- THEN it conforms to the documented prompt block schema
- AND each block is individually copyable in the UI

#### Scenario: Copy-all is available
- GIVEN a successful generation
- WHEN the owner chooses to copy all blocks
- THEN the system provides the full combined prompt for copying

### Requirement: Prompt Presets
The system SHALL allow selecting an owner-controlled preset that influences platform intent, aspect ratio, and visual tone without adding article facts.

#### Scenario: Preset shapes output intent
- GIVEN a selected preset with an aspect ratio and platform intent
- WHEN generation runs
- THEN the output reflects the preset's aspect ratio and intent

#### Scenario: Preset does not add facts
- GIVEN any preset
- WHEN generation runs
- THEN the preset does not introduce engineering facts absent from the article

### Requirement: Defensive Parsing and Failure Handling
The system SHALL parse the model response defensively and MUST return a clear, retryable error instead of silently returning empty or invented blocks.

#### Scenario: Response wrapped in markdown fences
- GIVEN a model response wrapped in code fences or surrounding prose
- WHEN the system parses it
- THEN the system extracts and validates the JSON successfully

#### Scenario: Unparseable response
- GIVEN a model response that cannot be parsed into valid JSON
- WHEN generation runs
- THEN the system returns a retryable error explaining the failure
- AND does not return empty blocks

#### Scenario: Schema mismatch
- GIVEN a parsed response that does not match the prompt block schema
- WHEN validation runs
- THEN the system returns a retryable error
- AND does not present the result as successful

#### Scenario: Provider or configuration failure
- GIVEN a missing configuration or an OpenRouter request failure
- WHEN generation runs
- THEN the system returns a safe error without exposing secrets

### Requirement: Generation Attempt Persistence
The system SHALL persist each generation attempt, including failures, with input hash, model id, preset snapshot, raw output, parsed result when available, status, and timestamp, and MUST NOT persist secrets.

#### Scenario: Successful attempt recorded
- GIVEN a successful generation
- WHEN it completes
- THEN an attempt record is stored with its metadata and parsed result

#### Scenario: Failed attempt recorded
- GIVEN a failed generation
- WHEN it completes
- THEN an attempt record is stored with the failure status and safe error detail
- AND no API key or authorization header is stored

### Requirement: Non-Authoritative Output Presentation
The system MUST present generated prompts as prompt-structuring assistance, not as verified engineering advice.

#### Scenario: Output is not presented as verified engineering
- GIVEN a returned prompt result
- WHEN it is displayed to the owner
- THEN the UI does not claim the content is technically verified or authoritative
