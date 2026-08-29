# Tasks: Social Media Revamp

## T1: Schema Migration
- [ ] Modify `drizzle/schema.ts`: rename posts.content→topic, drop summary/slug, add platform/tone/slide_count/excerpt
- [ ] Add tables: post_research_sources, prompt_slides, provider_variants
- [ ] Drop prompt_presets table
- [ ] Run `bun run db:generate` → create migration SQL
- [ ] Run `bun run db:migrate` → apply to local DB

## T2: Research Service
- [ ] Create `src/lib/server/researchService.ts`
- [ ] Implement `searchYouCom(query)` — call You.com MCP via mcp tool
- [ ] Implement `searchYouCom(query)` — use You.com MCP or direct API
- [ ] Implement `compileResearch(topic)` — orchestrate primary+fallback
- [ ] Implement `filterSources(results)` — relevance scoring
- [ ] No other env vars needed (You.com already available as MCP)
- [ ] Unit tests for researchService (mock You.com response)

## T3: Synthesis Service
- [ ] Create `src/lib/server/synthesisService.ts`
- [ ] Implement `synthesizeResearch(research, slideCount)` — LLM call via OpenRouter
- [ ] Build synthesis system prompt: "Rangkum data berikut jadi brief untuk N slide carousel"
- [ ] Parse LLM output → SlideBrief[] (defensive JSON parsing, reuse promptParser pattern)
- [ ] Unit tests for synthesis parser

## T4: Prompt Generator (rewrite)
- [ ] Rewrite `src/lib/server/promptGenerator.ts`:
  - `generateSlides(post, research)` — orchestrates synthesis + generation
  - `generateProviderVariants(slide)` — 3 variants per slide
  - `buildSystemPrompt(tone, platform)` — tone-aware system prompt
  - `buildProviderPrompt(slide, provider)` — per-provider template
- [ ] Update `promptSchema.ts`:
  - New types: Slide, ProviderVariant, ResearchBrief, SlideBrief
  - New SYSTEM_PROMPT for multi-slide generation
  - Provider templates (gpt-image, nano-banana, recraft)
- [ ] Update `factFidelityGuard.ts` — check against research sources, not article
- [ ] Update `generationApi.ts`:
  - `POST /api/posts/:id/research`
  - `GET /api/posts/:id/research`
  - `POST /api/posts/:id/approve-research`
  - `POST /api/posts/:id/generate` (updated flow)
  - `GET /api/posts/:id/slides`
- [ ] Unit tests for new generator

## T5: Posts API (modify)
- [ ] Update `posts.ts` query functions: createPost({topic, platform, tone, slide_count})
- [ ] Update `postsApi.ts`: POST /api/posts accepts new fields
- [ ] Add cascade delete: post → sources → slides → variants
- [ ] Update `seed.ts` if needed

## T6: UI — Post Form
- [ ] Rewrite `/owner/new/+page.svelte`:
  - Topic input (text, max 200)
  - Platform select (Instagram/Facebook/LinkedIn)
  - Tone select (detail/observatif/informatif/menjual/creative)
  - Slide count slider (3-7)
  - Remove: judul, ringkasan, isi artikel, kategori
- [ ] Update `/owner/new/+page.server.ts`
- [ ] Update `/owner/+page.svelte` — show topic instead of title
- [ ] Update `/owner/edit/[id]/+page.svelte` — edit new fields

## T7: UI — Research Panel
- [ ] Create `/owner/research/[id]/+page.svelte`:
  - Show search results (cards: title, snippet, url, engine badge)
  - "Approve Research" button
  - "Refine Query" input (re-search)
- [ ] Create `/owner/research/[id]/+page.server.ts`:
  - Load post + research sources
  - POST handler: approve research
- [ ] Create `ResearchPanel.svelte` component

## T8: UI — Carousel Preview
- [ ] Rewrite `/owner/generate/[id]/+page.svelte`:
  - Carousel preview (prev/next, slide counter)
  - Per slide: provider tabs (GPT Image / Nano Banana / Recraft)
  - Per provider: prompt text, copy button, visual notes
  - "Copy All for Provider" button
- [ ] Update `/owner/generate/[id]/+page.server.ts`
- [ ] Create `CarouselPreview.svelte`
- [ ] Create `SlideCard.svelte`
- [ ] Update `PromptResult.svelte` (or replace)

## T9: Public Feed (modify)
- [ ] Update `/+page.svelte` — show topic + excerpt instead of title + summary
- [ ] Update `/post/[id]/+page.svelte` — show topic, excerpt, research sources
- [ ] Remove `/post/[slug]/` route (slug deleted)
- [ ] Add `/post/[id]/` route

## T10: Cleanup
- [ ] Remove `presets.ts`, `presetsApi.ts` (prompt_presets dropped)
- [ ] Remove `PromptPresetSelector.svelte`
- [ ] Remove `/owner/presets/` route
- [ ] Update `api.ts` — remove presetsApi import
- [ ] Update `seed.ts` — remove preset seeding, add sample post with new schema

## T11: Testing & Verification
- [ ] Run `bun run db:generate` + `bun run db:migrate`
- [ ] Run `bun run check` — 0 errors
- [ ] Run `bun test --run` — all pass
- [ ] Run `bun run lint` — clean
- [ ] Manual smoke test: create post → research → generate → copy prompt
- [ ] Update DESIGN.md if implementation discoveries change stated facts
- [ ] `openspec validate social-media-revamp`

## Task Dependencies
```
T1 (schema) ─▶ T5 (posts API) ─▶ T6 (post form)
T1 ─▶ T2 (research) ─▶ T7 (research UI)
T1 ─▶ T3 (synthesis) ─▶ T4 (generator) ─▶ T8 (carousel UI)
T4 ─▶ T9 (public feed)
T5 ─▶ T10 (cleanup)
All ─▶ T11 (testing)
```

## T12: Design System Implementation
- [ ] Setup Google Fonts: Space Grotesk, Inter, JetBrains Mono
- [ ] Update `app.css` with CSS custom properties from design.md (colors, spacing, radii)
- [ ] Configure Tailwind theme: extend with design tokens (no default palette, use design system)
- [ ] Create `BlueprintGrid.svelte` component (signature element, owner-only)
- [ ] Update `+layout.svelte` to inject BlueprintGrid on /owner/* routes
- [ ] Verify dark mode forced (no light mode toggle)
- [ ] Test reduced motion preference
