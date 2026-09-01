# Tasks: Generation Progress Feedback

## 1. Component

- [x] 1.1 Create `src/lib/components/LoadingIndicator.svelte` with `label`, optional `hint`, `role="status"`, `aria-live="polite"`, and `aria-busy="true"`.
- [x] 1.2 Render a spinner, an indeterminate bar, and the supplied label.
- [x] 1.3 Suppress animation under `prefers-reduced-motion: reduce`.
- [x] 1.4 Use existing project tokens only; do not invent new colours or status semantics.

## 2. Integration

- [x] 2.1 Mount the indicator in `src/routes/owner/edit/[id]/+page.svelte` while `researching` is true.
- [x] 2.2 Mount the indicator in `src/lib/components/StyleLockPanel.svelte` while `generating` is true.
- [x] 2.3 Mount the indicator in `src/lib/components/VisualCommandRecommendationPanel.svelte` while `loading` is true.
- [x] 2.4 Mount the indicator in `src/routes/owner/generate/[id]/+page.svelte` while `generating` is true.
- [x] 2.5 Keep existing disabled states and button label swaps unchanged.

## 3. Verification

- [x] 3.1 Test that the component renders the supplied label.
- [x] 3.2 Test that it exposes an accessible live region and busy state.
- [x] 3.3 Test that it contains no percentage or numeric time estimate.
- [x] 3.4 `bun run check` passes.
- [x] 3.5 `bun test --run` passes.
- [x] 3.6 `bun run lint` passes.
- [x] 3.7 `openspec validate generation-progress-feedback` passes.

## Dependencies

```
1 (component) -> 2 (integration) -> 3 (verification)
```

No API, database, or prompt change.
