# Content Delta

## MODIFIED Requirements

### Requirement: Owner Post Authoring
The system SHALL allow the authenticated owner to create, edit, and delete social media posts with a topic, platform target, tone, and slide count.

#### Scenario: Create a social media post
- GIVEN an authenticated owner
- WHEN the owner submits a valid topic, platform, tone, and slide_count (3-7)
- THEN the system persists the post as a draft
- AND the post appears in the owner workspace

#### Scenario: Edit a post
- GIVEN an existing post owned by the owner
- WHEN the owner updates the topic, platform, tone, or slide_count with valid values
- THEN the system saves the changes

#### Scenario: Delete a post
- GIVEN an existing post owned by the owner
- WHEN the owner deletes the post
- THEN the system removes it from the feed and owner workspace
- AND all related research sources, prompt slides, and provider variants are cascade deleted

#### Scenario: Reject invalid post input
- GIVEN a post submission with an empty topic, an unsupported platform/tone value, or slide_count outside 3-7
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

### Requirement: Post Publication State
The system SHALL distinguish between draft and published posts and MUST only display published posts in the public feed.

#### Scenario: Draft is hidden from public
- GIVEN a post in draft state
- WHEN a public visitor views the feed
- THEN the draft post is not listed

#### Scenario: Published post is visible
- GIVEN a post in published state
- WHEN a public visitor views the feed
- THEN the post is listed with its topic and auto-generated excerpt

### Requirement: Platform and Tone Configuration
The system SHALL support three platforms (instagram, facebook, linkedin) and five tones (detail, observatif, informatif, menjual, creative) as fixed enums on each post.

#### Scenario: Platform determines aspect ratio
- GIVEN a post with platform=instagram
- WHEN the system generates prompt slides
- THEN the default aspect ratio is 1:1 or 4:5

#### Scenario: Tone determines prompt style
- GIVEN a post with tone=menjual
- WHEN the system generates prompt slides
- THEN hooks include pain points and CTAs include action-driven language like "DM for consultation"

## REMOVED Requirements

### Requirement: Article Body Authoring (REMOVED)
The previous requirement for the owner to author a long article body (up to 10,000 characters) is REMOVED. Posts are now short-topic based.

#### Scenario: Migration impact
- GIVEN an existing post with content
- WHEN the schema migration runs
- THEN the old `content` field is renamed to `topic` and truncated to 200 characters
- AND the old `summary` and `slug` fields are dropped
- AND the owner must recreate any post that exceeds the new topic limit

### Requirement: Categories and Tags (REMOVED)
The category and tag system is REMOVED in this revision. Posts are now classified only by platform and tone.

#### Scenario: No category or tag UI
- GIVEN the new schema
- WHEN the owner views the post form
- THEN no category or tag selector is displayed

### Requirement: Prompt Presets (REMOVED)
The standalone `prompt_presets` table and the /owner/presets page are REMOVED. Platform-specific prompt templates are now inline in the prompt generator.

#### Scenario: No presets management UI
- GIVEN the new schema
- WHEN the owner navigates the workspace
- THEN no "Presets" link is displayed

## ADDED Requirements

### Requirement: Research Sources Persistence
The system SHALL persist research sources fetched during post creation, including source URL, title, snippet, engine (you.com only), and relevance score.

#### Scenario: You.com returns results
- GIVEN a post in research stage
- WHEN the research service queries You.com successfully
- THEN each result is saved as a `post_research_sources` row with engine=you.com

#### Scenario: You.com returns results
- GIVEN a post in research stage
- WHEN the research service queries You.com successfully
- THEN each result is saved as a `post_research_sources` row with engine=you.com

### Requirement: Prompt Slide Structure
The system SHALL support generating N prompt slides (3-7) per post, where each slide has a type (hook, problem, data, solution, cta, custom) and an ordered index.

#### Scenario: Generate carousel slides
- GIVEN an approved post with research sources
- WHEN the owner triggers generation
- THEN N rows are created in `prompt_slides`, one per slide
- AND slide_index starts at 0 (hook) and increments sequentially

### Requirement: Provider Variants
The system SHALL generate 3 provider variants per slide (gpt-image, nano-banana, recraft), each containing a copy-ready prompt, visual notes, on-image text, and aspect ratio.

#### Scenario: Generate per-provider prompts
- GIVEN a prompt slide
- WHEN the generator processes the slide
- THEN 3 rows are created in `provider_variants`, one per supported provider
- AND each variant's prompt_text follows the provider-specific template

#### Scenario: Copy prompt for specific provider
- GIVEN a generated slide with 3 provider variants
- WHEN the owner clicks copy on the gpt-image tab
- THEN the gpt-image prompt_text is copied to clipboard
- AND the UI shows a "Copied!" confirmation
