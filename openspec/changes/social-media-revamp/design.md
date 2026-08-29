# Design: Social Media Post Generation Architecture

## System Context

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Owner (User)  │────▶│  SvelteKit UI    │────▶│  Elysia API     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                           │
                              ▼                           ▼
                        ┌──────────┐              ┌──────────────┐
                        │  Forms   │              │  Services    │
                        │  Pages   │              │  Pipeline    │
                        └──────────┘              └──────────────┘
                                                           │
                              ┌────────────────────────────┼────────────┐
                              ▼                            ▼            ▼
                        ┌──────────┐              ┌──────────────┐  ┌──────────┐
                        │  SQLite  │              │  OpenRouter  │  │ You.com  │
                        │  (D1)    │              │  (LLM)       │  │ (Search) │
                        └──────────┘              └──────────────┘  └──────────┘
                              ▲                            │            │
                              │                            ▼            ▼
                              │                     ┌─────────────────────────┐
                              │                     │  You.com MCP (fallback) │
                              │                     └─────────────────────────┘
                              │
                        ┌──────────────┐
                        │  External    │
                        │  Generators  │
                        │  (GPT Image, │
                        │  Nano Banana,│
                        │  Recraft)    │
                        └──────────────┘
```

## Data Flow

1. **Create Post** (`POST /api/posts`)
   - Input: topic, platform, tone, slide_count
   - Output: post.id
   - Status: draft

2. **Research** (`POST /api/posts/:id/research`)
   - Input: post.topic
   - Query: You.com (only)
   - Persist: post_research_sources
   - Output: research_brief (JSON)

3. **Approve Research** (`POST /api/posts/:id/approve-research`)
   - Input: approved sources + optional custom query
   - Status: research_approved

4. **Generate Prompts** (`POST /api/posts/:id/generate`)
   - Input: post + research_brief + platform + tone + slide_count
   - Stage 2: LLM synthesis → research_brief per slide
   - Stage 3: LLM generation → prompt_slides + provider_variants
   - Persist: prompt_slides, provider_variants
   - Output: generation result

5. **View Results** (`GET /api/posts/:id/slides`)
   - Output: slides with provider variants
   - UI: carousel preview + copy buttons

## New Services

### researchService.ts
- `searchYouCom(query: string): Promise<SearchResult[]>`
- `compileResearch(topic: string): Promise<ResearchBrief>`
- `filterSources(results: SearchResult[]): SearchResult[]`

### promptGenerator.ts (modified)
- `generateSlides(post: Post, research: ResearchBrief): Promise<Slide[]>`
- `generateProviderVariants(slide: Slide): Promise<ProviderVariant[]>`
- `buildSystemPrompt(tone: Tone, platform: Platform): string`

### synthesisService.ts (new)
- `synthesizeResearch(research: ResearchBrief, slideCount: number): Promise<SlideBrief[]>`
- `buildSynthesisPrompt(research: ResearchBrief): string`

## Schema Changes

### Migration Strategy
1. Rename `posts.content` → `posts.topic` (data loss acceptable, MVP)
2. Drop `posts.summary`, `posts.slug`
3. Add `posts.platform`, `posts.tone`, `posts.slide_count`, `posts.excerpt`
4. Create `post_research_sources`, `prompt_slides`, `provider_variants`
5. Drop table `prompt_presets` (data loss acceptable, MVP)

### Backward Compatibility
- Tidak perlu. Ini adalah breaking change untuk MVP.
- User (owner) akan recreate post setelah deploy.

## UI Components

### PostForm.svelte
- Field: topic (text), platform (select), tone (select), slide_count (slider 3-7)
- Submit → create post → redirect to research

### ResearchPanel.svelte
- Show: search results (cards with title, snippet, url)
- Actions: approve, refine query, manual add source
- Submit → approve → redirect to generate

### CarouselPreview.svelte
- Show: slides as carousel (prev/next navigation)
- Per slide: provider tabs (GPT Image / Nano Banana / Recraft)
- Per provider: copy button, prompt text, visual notes

### SlideCard.svelte
- Show: slide title, type badge, prompt text
- Actions: copy prompt, copy all slides for this provider

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/posts | Create social media post |
| POST | /api/posts/:id/research | Trigger research |
| GET | /api/posts/:id/research | Get research results |
| POST | /api/posts/:id/approve-research | Approve research |
| POST | /api/posts/:id/generate | Generate prompt slides |
| GET | /api/posts/:id/slides | Get generated slides |
| DELETE | /api/posts/:id | Delete post (cascade: sources, slides, variants) |

## Design System (Token System)

### Color Palette

Inspired by Pinnacle Design Lab's industrial, high-tech aesthetic, adapted for a construction/engineering social media content tool.

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0b` | Main background, dark industrial |
| `--bg-secondary` | `#141416` | Card surfaces, panels |
| `--bg-elevated` | `#1c1c1f` | Elevated cards, modals |
| `--text-primary` | `#f5f5f5` | Headlines, primary text |
| `--text-secondary` | `#a1a1aa` | Body text, descriptions |
| `--text-muted` | `#71717a` | Captions, metadata |
| `--accent` | `#f97316` | Safety orange — CTAs, active states, highlights |
| `--accent-hover` | `#ea580c` | Accent hover state |
| `--accent-subtle` | `rgba(249, 115, 22, 0.1)` | Accent backgrounds, badges |
| `--border` | `#27272a` | Dividers, card borders |
| `--border-hover` | `#3f3f46` | Hover borders |
| `--success` | `#22c55e` | Success states, published |
| `--warning` | `#eab308` | Warning, draft |
| `--error` | `#ef4444` | Error states |

### Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | `Space Grotesk` | 700 | Page titles, hero text |
| Heading | `Inter` | 600 | Section headings, card titles |
| Body | `Inter` | 400 | Paragraphs, descriptions |
| Mono | `JetBrains Mono` | 400 | Code, prompt text, data |
| Caption | `Inter` | 500 | Labels, badges, metadata |

Type scale (px):
- Display: 48/56 (desktop), 32/40 (mobile)
- H1: 32/40
- H2: 24/32
- H3: 20/28
- Body: 16/24
- Caption: 14/20
- Mono: 13/20

### Layout

- Max content width: 1280px
- Grid: 12-column with 24px gap
- Card border-radius: 12px
- Button border-radius: 8px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Signature Element

**The "Blueprint Grid"** — a subtle, animated CSS grid overlay on the workspace background that evokes architectural blueprints. Visible only in the owner workspace (`/owner/*`), not on public pages. Grid lines are 1px at 5% opacity, with occasional crosshairs at intersections. This is the one memorable visual element that grounds the tool in its construction/architecture domain.

### Component Style

- Cards: bg-secondary, border 1px, shadow-none, hover:border-hover
- Buttons: 
  - Primary: accent bg, white text, no border
  - Secondary: transparent bg, accent border, accent text
  - Ghost: transparent bg, text-secondary, hover:bg-elevated
- Inputs: bg-secondary, border, focus:border-accent, focus:ring-accent/20
- Badges: accent-subtle bg, accent text, rounded-full
- Tabs: underline style, accent active indicator

### Motion

- Page transitions: 200ms ease-out fade
- Card hover: 150ms ease border-color + subtle translateY(-2px)
- Button hover: 150ms ease background-color
- Skeleton loading: shimmer animation on bg-secondary
- Carousel slide: 300ms ease-in-out translateX
- **Reduced motion**: respect `prefers-reduced-motion`, disable animations

### Dark Mode Only

This design is dark-mode only. No light mode toggle. The industrial dark aesthetic is integral to the brand.

## Environment Variables

```
# Existing
DATABASE_URL
OPENROUTER_API_KEY
OPENROUTER_MODEL
SESSION_SECRET
ADMIN_PASSWORD_HASH

# New: (none — You.com is provided by opencode MCP, no env var needed)

## Key Decisions

1. **You.com sebagai satu-satunya search** — sudah tersedia sebagai MCP di opencode, serverless-friendly, gratis
2. **You.com sebagai satu-satunya search provider** — tidak ada SearXNG atau provider lain
3. **Prompt per provider** — tiap provider punya style prompt sendiri, user copy yang cocok
4. **Slide-based generation** — tiap slide punya tipe (hook/data/solution/cta), bukan flat list
5. **Research approval** — owner bisa review dan approve hasil riset sebelum generate, memastikan fakta benar
