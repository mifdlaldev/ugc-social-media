# Proposal: Dynamic Research Capacity

## Context

Research is the only source of external factual data for prompt generation. It runs once per topic via You.com, and every run collects the same small, fixed set of links.

The current implementation hardcodes a result limit of `10` in two places: the `searchYouCom` default and the `compileResearch` call. The owner observes that each research run returns the same links, which leaves the synthesis and prompt-generation stages with little material and no way to gather new sources by re-running research.

## Problem

- The result count is a fixed `10`, repeated in two places, regardless of the topic's needs.
- Re-researching a post returns the same links, so the owner cannot surface new material without inventing a new topic.
- A fixed small set weakens the downstream synthesis and prompt stages, which rely on the research brief.

## Solution

Make research collection dynamic but bounded, without changing the search provider, the persistence schema, or the API surface.

- Replace scattered hardcoded result counts with a required `RESEARCH_RESULT_COUNT` environment variable. The value is the single authority for research capacity; research code holds no numeric default.
- Deduplicate results by URL within a single research run.
- Exclude results whose snippet is empty or whitespace-only, so only substantive sources reach the brief.
- When a post is re-researched, exclude URLs already persisted for that post so later runs surface new links when they exist.
- Preserve `RESEARCH_EMPTY`: research still fails clearly when no usable sources remain.

## Scope

### In scope

- A single runtime configuration value replacing the two hardcoded `10`s.
- URL deduplication within a research run.
- Quality filter that drops results without a substantive snippet.
- Re-research variety: skipping URLs already persisted for the post.
- Tests covering the default count, deduplication, quality filter, and re-research behaviour.

### Out of scope

- Schema changes to `post_research_sources` or any other table.
- API route changes or new request parameters.
- New You.com API parameters beyond `num_web_results`, which is already used.
- Query-phrasing heuristics, query expansion, or multiple simultaneous queries per topic.
- LLM involvement in research, relevance scoring, or source selection.
- Changes to synthesis, style-lock, recommendation, or prompt generation.

## Success Criteria

- `RESEARCH_RESULT_COUNT` is required and valid; no research code contains a numeric fallback or separate result-count constant.
- Within a research run, all returned sources have a non-empty snippet and a unique URL.
- Re-researching a post returns new links when the provider has more results to offer.
- Research still fails with `RESEARCH_EMPTY` when nothing usable remains.
- Existing API responses and the persisted schema are unchanged.

## Risks

- The provider may return fewer results than the active research capacity allows. Mitigation: take whatever the API returns, bound to the requested maximum, and throw `RESEARCH_EMPTY` only when nothing usable remains.
- Moving from a fixed small collection to a larger capacity may behave differently on the provider side. Mitigation: verify with a live probe during implementation, and keep the active limit controlled by a single configuration source.
- Re-research variety could return weaker results if the provider's later results are thinner. Mitigation: keep the quality filter as the floor, and never fabricate or substitute sources.
