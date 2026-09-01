# Design: Dynamic Research Capacity

## Decision

Keep You.com as the only research provider and keep the existing research endpoint contract. Make source collection more useful by separating collection, filtering, and persistence concerns.

`compileResearch` receives the topic and an optional set of previously persisted URLs. It calls You.com once using the active research capacity configuration, normalizes the returned records, removes unusable snippets and duplicate URLs, then removes URLs present in the previous-run set. It returns the remaining sources as the brief input.

No LLM call participates in research. No source, fact, score, title, snippet, or URL is generated locally.

## Collection Contract

- `RESEARCH_RESULT_COUNT` is a required environment variable holding the active research capacity.
- The implementation must expose it through a single configuration accessor, validate it as a positive integer at startup, and throw a clear configuration error when it is missing or invalid.
- There is no hardcoded fallback value; the owner sets the capacity for each environment.
- The value is passed to You.com's existing `num_web_results` parameter.
- The provider remains authoritative for returned titles, URLs, and snippets.
- The service may return fewer results than requested.
- The service never pads a short response with invented or previously discarded records.

The exact maximum accepted by You.com is not assumed in this change. The implementation must verify the live endpoint behaviour before relying on a count greater than the current value. If the provider rejects the configured count, the implementation must keep the failure explicit rather than silently changing the requested count.

## Normalization and Dedupe

A source is usable only when its URL is non-empty and its selected snippet is non-empty after trimming. The selected snippet remains the first provider snippet, falling back to provider description, matching current behaviour.

Dedupe uses the normalized URL string as the identity within one run. The first provider result wins, preserving provider order. Previous-run exclusion compares the same URL identity against URLs supplied by the caller.

The service does not infer relevance from title wording, rewrite snippets, or merge facts across sources. Research output remains provider data.

## Re-research Flow

The post research route reads existing `post_research_sources` rows before calling `compileResearch`. It passes those URLs as the previous-run exclusion set. On success, the route merges the existing rows with the newly collected sources, deduplicating by URL with existing rows winning, then replaces the stored set with the merged result.

If no new usable sources exist, the route returns success with zero new items and does not delete or modify the previously stored sources. This prevents a re-research run that surfaces nothing from erasing useful evidence or showing a failing error dialog.

The current first-run response remains unchanged: `success: true` and source count. No route parameters or response fields are added.

## Prompt-Grounding Boundary

Research sources are inputs to later synthesis, not claims authorized by the service itself. Downstream prompt generation remains responsible for article/research approval and fact-fidelity rules already specified elsewhere. This change does not allow the service or model to add facts absent from provider results or approved inputs.

## Testing

- Mock You.com response and assert requested `num_web_results` equals the active research capacity configuration.
- Return duplicate URLs and empty snippets; assert only the first substantive record per URL remains.
- Pass previous URLs to `compileResearch`; assert those URLs are omitted and new provider results remain.
- Assert `RESEARCH_EMPTY` for an empty or fully filtered response.
- Assert the research route reads existing URLs before replacement and does not delete old rows when collection fails.
- Run `bun run test`, `bun run check`, `bun run lint`, and `openspec validate dynamic-research-capacity`.
