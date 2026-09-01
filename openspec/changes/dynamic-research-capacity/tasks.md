# Tasks: Dynamic Research Capacity

## 1. Result Count Configuration

- [x] 1.1 Add a `researchResultCount` getter to `src/lib/server/config.ts` reading `RESEARCH_RESULT_COUNT`, validating as a positive integer, throwing a clear error when missing or invalid.
- [x] 1.2 Document `RESEARCH_RESULT_COUNT` in `AGENTS.md` and `.env.example` as required, no default.
- [x] 1.3 Update `searchYouCom` to use `config.researchResultCount` when no explicit caller value is supplied, removing the hardcoded default `10`.
- [x] 1.4 Update `compileResearch` to use the same configuration source instead of a hardcoded `10`.
- [x] 1.5 Live probe: `num_web_results=30` accepted, provider free tier returns 10 results (provider cap, not code cap).

## 2. Quality Filter

- [x] 2.1 Filter out records whose URL is empty after trimming.
- [x] 2.2 Filter out records whose selected snippet is empty or whitespace-only after trimming.
- [x] 2.3 Preserve existing snippet selection logic: first provider snippet, falling back to provider description.

## 3. Deduplication

- [x] 3.1 Deduplicate remaining records by normalized URL (case-insensitive string comparison).
- [x] 3.2 Keep the first provider record for each URL, preserving provider order.

## 4. Re-research Exclusion

- [x] 4.1 Add an optional `excludeUrls` parameter to `compileResearch` and `searchYouCom`.
- [x] 4.2 After deduplication, exclude records whose URL is in the `excludeUrls` set.
- [x] 4.3 Update `POST /api/posts/:id/research` to read existing `post_research_sources` rows before calling `compileResearch`.
- [x] 4.4 Pass them as the exclusion set.
- [x] 4.5 On re-research success: merge existing + new sources, dedup by URL, replace stored set with merged result.
- [x] 4.6 On re-research failure (RESEARCH_EMPTY with existing sources): return `{ success: true, count: 0 }`, preserve stored sources.

## 5. Testing

- [x] 5.1 Test that the default `searchYouCom` call uses `config.researchResultCount`.
- [x] 5.2 Test that duplicate URLs are deduplicated, keeping only the first.
- [x] 5.3 Test that records with empty URL or empty snippet are filtered out.
- [x] 5.4 Test that `excludeUrls` omits those URLs from the result.
- [x] 5.5 Test that `RESEARCH_RESULT_COUNT` missing/invalid throws a clear config error.
- [x] 5.6 Test that `RESEARCH_EMPTY` is thrown when all results are filtered out.
- [x] 5.7 `bun run test`, `bun run check`, `bun run lint` pass.
- [x] 5.8 `openspec validate dynamic-research-capacity` passes.

## 6. Documentation

- [x] 6.1 Update OpenSpec spec to reflect merge semantics.
- [x] 6.2 Update OpenSpec design to reflect merge semantics.

## Dependencies

```
1 (config) -> 2 (filter) -> 3 (dedup) -> 4 (re-research) -> 5 (testing)
```
