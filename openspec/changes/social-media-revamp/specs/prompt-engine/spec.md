# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Prompt Generation Pipeline
The system SHALL generate structured prompt slides for external image generators by orchestrating research, synthesis, and generation stages.

#### Scenario: Full pipeline from topic to prompts
- GIVEN an approved post with research sources, platform, tone, and slide_count
- WHEN the owner triggers generation
- THEN the system synthesizes research into per-slide briefs
- AND generates 3 provider variants per slide
- AND persists the result to prompt_slides and provider_variants

#### Scenario: Generation attempt logged
- GIVEN any generation trigger
- WHEN the pipeline runs
- THEN a row is inserted into `generation_attempts` with input hash, model, raw output, parsed result, and timestamp

### Requirement: Fact Fidelity Guard
The system SHALL verify that all numbers and multi-word capitalized phrases in the generated output originate from the research sources or the user-provided topic.

#### Scenario: Numbers match research
- GIVEN a research brief containing "Rp 800.000 per m3"
- WHEN the generator produces a prompt slide
- THEN the slide must reference the same numerical value or omit it
- AND missing numbers are reported in `fidelityNotes`

#### Scenario: Multi-word proper nouns match
- GIVEN a research brief containing "Bata Ringan AAC"
- WHEN the generator produces a prompt slide
- THEN the slide must reference "Bata Ringan AAC" or omit it
- AND single-word capitalized words are ignored (sentence-start noise in Indonesian)

## REMOVED Requirements

### Requirement: Single-Article Generation (REMOVED)
The previous single-prompt generation flow (one article → one prompt) is REMOVED. Generation now produces multi-slide carousels.

#### Scenario: No single-prompt endpoint
- GIVEN the new pipeline
- WHEN the owner submits a post for generation
- THEN the output is N slides × M provider variants, not a single prompt

### Requirement: Article-Based Fact Source (REMOVED)
Fact fidelity was previously checked against the article body. It is now checked against the research sources and topic.

#### Scenario: Article body not used
- GIVEN a post created in the new flow
- WHEN the generator runs
- THEN the system reads from `post_research_sources`, not from a `posts.content` field

## ADDED Requirements

### Requirement: Real-Time Research Stage
The system SHALL fetch real-time data via the You.com MCP before generating prompts, to ensure factual accuracy and up-to-date information.

#### Scenario: You.com search works
- GIVEN a post with topic="Bata merah vs bata ringan"
- WHEN the research service runs
- THEN the system queries the You.com MCP
- AND the top 10 results are returned within 10 seconds
- AND each result is persisted with engine=you.com

#### Scenario: You.com returns no results
- GIVEN a You.com query returns 0 results or errors
- WHEN the research service cannot compile a brief
- THEN the system returns an error to the owner
- AND no prompt slides are generated

#### Scenario: No other search provider
- GIVEN the system architecture
- WHEN the research service runs
- THEN ONLY You.com is used
- AND no other search API is configured, called, or stored

### Requirement: Per-Provider Prompt Templates
The system SHALL maintain distinct prompt templates for 3 image generation providers: gpt-image, nano-banana, and recraft.

#### Scenario: GPT Image variant includes typography instructions
- GIVEN a slide for gpt-image
- WHEN the prompt is built
- THEN the prompt_text includes "render text accurately" and font/typography descriptors

#### Scenario: Nano Banana variant emphasizes visual storytelling
- GIVEN a slide for nano-banana
- WHEN the prompt is built
- THEN the prompt_text includes "minimal text overlay" and "photorealistic" or "3D render" descriptors

#### Scenario: Recraft variant uses vector style
- GIVEN a slide for recraft
- WHEN the prompt is built
- THEN the prompt_text includes "vector illustration" and "limited color palette" descriptors

### Requirement: Research Approval Gate
The system SHALL require the owner to explicitly approve research results before allowing prompt generation.

#### Scenario: Block generation before approval
- GIVEN a post with research sources saved
- WHEN the owner clicks "Generate" without approving research
- THEN the system redirects to the research panel

#### Scenario: Approve and continue
- GIVEN a post with research sources
- WHEN the owner clicks "Approve Research"
- THEN the post status advances to research_approved
- AND the "Generate" button becomes enabled

### Requirement: Per-Slide Type and Order
The system SHALL assign each generated slide a semantic type (hook, problem, data, solution, cta, custom) and preserve a strict ordering.

#### Scenario: First slide is hook
- GIVEN a post with slide_count=5
- WHEN the generator produces slides
- THEN slide_index=0 has slide_type=hook
- AND slide_index=N-1 has slide_type=cta

#### Scenario: Body slides have data/solution types
- GIVEN a post with slide_count=5
- WHEN the generator produces body slides (1-3)
- THEN the slide_type is distributed across problem, data, solution, custom
