# Research Service Delta

## MODIFIED Requirements

### Requirement: Research Source Collection

The research service SHALL collect sources from the only configured provider using `num_web_results` derived from required `RESEARCH_RESULT_COUNT`. The service SHALL NOT use a hardcoded result count in research code.

#### Scenario: Configured count is used
- GIVEN a research run with no explicit caller override
- AND `RESEARCH_RESULT_COUNT` contains a positive integer
- WHEN the research service requests provider results
- THEN the request uses that configured count

#### Scenario: Missing or invalid count
- GIVEN `RESEARCH_RESULT_COUNT` is missing or is not a positive integer
- WHEN the research service requests provider results
- THEN the service returns a clear configuration error
- AND it does not call the provider

#### Scenario: Provider returns usable results
- GIVEN the provider returns results with non-empty URLs and non-empty snippets
- WHEN the service normalizes the results
- THEN each returned source contains only provider-provided URL, title, and selected snippet

### Requirement: Research Source Quality

The research service SHALL exclude results whose selected snippet is empty or whitespace-only after trimming, and SHALL exclude results whose URL is empty.

#### Scenario: Provider returns a result without a usable snippet
- GIVEN the provider returns a result with an empty or whitespace-only snippet
- WHEN the service returns usable sources
- THEN the result is excluded from the usable set

#### Scenario: Provider returns a result without a URL
- GIVEN the provider returns a result with an empty URL
- WHEN the service returns usable sources
- THEN the result is excluded from the usable set

### Requirement: Research Source Deduplication

The research service SHALL deduplicate sources by normalized URL within one research run. The first provider result for a given URL SHALL be kept.

#### Scenario: Provider returns duplicate URLs in one run
- GIVEN the provider returns multiple results with the same URL
- WHEN the service returns usable sources
- THEN only the first result for that URL is retained

### Requirement: Research Source Exclusion

The research service SHALL accept a set of previously persisted URLs. Sources whose URL is present in that set SHALL be excluded from the usable result set.

#### Scenario: Re-researching a post
- GIVEN a post with previously persisted research URLs
- WHEN the owner re-runs research for the same topic
- THEN previously persisted URLs are excluded from the usable result set

#### Scenario: Re-research yields no new usable results
- GIVEN a post with previously persisted research URLs
- WHEN re-research returns no new usable results after exclusion
- THEN research succeeds with zero new items
- AND previously stored sources are preserved

#### Scenario: Re-research yields new usable results
- GIVEN a post with previously persisted research sources
- WHEN re-research returns new usable sources
- THEN existing and new sources are stored together
- AND duplicate URLs are stored only once
- AND existing source records take precedence for matching URLs

### Requirement: Research Empty Failure

The research service SHALL throw a research-empty failure when no usable sources remain after filtering, deduplication, and exclusion.

#### Scenario: No usable sources remain
- GIVEN provider results that are empty or fully filtered out
- WHEN the service finishes filtering
- THEN the service throws a research-empty failure
