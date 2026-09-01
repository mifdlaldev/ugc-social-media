# Proposal: Generation Progress Feedback

## Context

Several owner actions perform remote research or LLM generation and may take long enough that the current button-only text state feels stalled. The UI currently changes button labels while waiting, but does not provide a consistent visual loading indicator.

## Problem

The owner cannot quickly distinguish an active request from an unresponsive page. A numeric percentage would be misleading because the current API returns one response only after each operation completes and does not report server-side progress.

## Solution

Add a reusable loading indicator containing a spinner and an indeterminate progress bar. Show it while each supported research or generation request is active. Use stage-specific labels already known by the UI, without inventing duration, completion percentage, or server progress.

The indicator SHALL preserve existing layout, controls, error handling, and request behavior. It SHALL be removed when the request succeeds or fails.

## Scope

### In scope

- A reusable Svelte loading indicator component.
- Loading feedback for research, style-lock generation, visual-command recommendation, and prompt generation.
- Accessible busy state and status text.
- Reduced-motion-safe animation.

### Out of scope

- API changes.
- Server-side progress tracking, polling, streaming, or SSE.
- Numeric progress percentages.
- Changes to prompt content, model behavior, research data, or fact-fidelity rules.

## Success Criteria

- Every supported remote operation visibly indicates active work.
- Indicator never claims a numeric completion percentage.
- Existing buttons remain usable and disabled states remain intact.
- Existing success, error, and navigation behavior remains unchanged.
- UI passes typecheck, tests, lint, and OpenSpec validation.
