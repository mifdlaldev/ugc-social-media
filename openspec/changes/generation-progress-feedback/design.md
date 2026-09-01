# Design: Generation Progress Feedback

## Decision

Add one presentational component and use it in every place that already tracks a pending remote request. No API, database, or prompt change.

Progress is indeterminate by design. `POST /api/posts/:id/generate` performs one synthesis call plus one call per slide and returns a single response at the end, so the client cannot know a truthful percentage. Showing a determinate bar would require server-side stage reporting, which is out of scope for this change.

## Component

`src/lib/components/LoadingIndicator.svelte`

Props:

- `label: string` — the stage text the caller already displays.
- `hint?: string` — optional secondary line for a known constraint, supplied by the caller.

Markup:

- a spinner element,
- an indeterminate bar,
- the label text.

Accessibility:

- `role="status"` with `aria-live="polite"` so the label is announced once.
- `aria-busy="true"` on the wrapper while mounted.
- The animation is wrapped in a `prefers-reduced-motion: reduce` guard that stops movement and leaves a static bar.

The component renders only when the caller mounts it, so no internal timers, no simulated advancement, and no fabricated duration estimate exist.

## Call Sites

Existing state variables already gate each request, so each site mounts the indicator from its own flag:

| Location                                  | Flag              | Label source        |
| ----------------------------------------- | ----------------- | ------------------- |
| `src/routes/owner/edit/[id]/+page.svelte` | `researching`     | research stage      |
| `src/lib/components/StyleLockPanel.svelte`| `generating`      | style-lock stage    |
| `src/lib/components/VisualCommandRecommendationPanel.svelte` | `loading` | recommendation stage |
| `src/routes/owner/generate/[id]/+page.svelte` | `generating`  | slide-generation stage |

The `saving` flag in `StyleLockPanel` and the `applying` flag in the recommendation panel are short local writes, not generation, and keep their existing button-label treatment.

Buttons keep their current disabled bindings and their current label swaps. The indicator is additive.

## Styling

Reuse existing tokens already present in the project's stylesheet rather than introducing a new palette: the accent colour for the moving element and the existing border and muted-text tokens for the track and label. The indicator sits inside the card that owns the action, so page structure is unchanged.

## Testing

Component-level assertions in the existing Vitest setup:

- the indicator renders the supplied label,
- it exposes a polite live region and a busy state,
- it renders no numeric percentage text,
- it renders no `value`/`max` progress attributes that would imply determinate progress.

Then `bun run check`, `bun test --run`, `bun run lint`, and `openspec validate generation-progress-feedback`.

## Explicit Non-Decisions

- No polling, streaming, or SSE.
- No server progress field.
- No numeric percentage or ETA.
- No change to request payloads, responses, or error text.
- No claim about how long any provider call takes.
