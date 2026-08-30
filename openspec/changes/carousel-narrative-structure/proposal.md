# Proposal: Stronger Carousel Narrative from Hook to CTA

## Context

The current synthesis pipeline requires the first slide to be `hook` and the last slide to be `cta`. It allows 3–7 slides. The owner wants a maximum of 10 images and asked whether creator-oriented carousel practices justify stronger hooks, a mid-carousel action, and a deliberate progress indicator.

You.com research was performed on 2026-08-30 and recorded in `docs/carousel-structure-reference.md`. The sources are predominantly third-party marketing publications. They agree on the structural pattern hook → value → CTA but disagree on numerical performance benchmarks and optimal length.

## Problem

- The current 3–7 range cannot support a full educational arc when the topic needs context, multiple value slides, a summary, and a final CTA.
- Slide 2 can be encountered independently through carousel re-serving, but the current `problem` role does not require it to stand alone.
- There is no deliberate mid-carousel save prompt for reference-oriented engineering education.
- There is no controlled progress text in the generated prompt, while image models may add unrequested carousel dots or other interface decoration.
- The current final CTA is not explicitly constrained to one action.

## Solution

Change the carousel contract to **5–10 slides**, default **7**, with a role-aware narrative:

- Slide 1: strongest hook and specific learning promise.
- Slide 2: standalone context hook that makes sense without slide 1.
- Middle slides: one self-contained value, data, problem, solution, or custom idea per slide.
- One middle slide near the midpoint: a soft save CTA, selected only when the structure has a meaningful reference payoff.
- Last slide: one final CTA selected for the educational post, defaulting to save/follow behavior as defined by the approved implementation rules.
- Every slide: deliberate small progress text `N/M`, where `N` is the one-based slide number and `M` is the total.

The progress text is an artwork instruction, not a social-media interface. Fake dot indicators, swipe arrows, page chrome, borders, watermarks, and extra text remain excluded.

## Recommended structures

### 5 slides

1. Hook
2. Standalone context hook
3. Key value/data
4. Solution or takeaway + soft save CTA
5. Final single-action CTA

### 6–9 slides

1. Hook
2. Standalone context hook
3–(M-2): self-contained value slides
One middle slide near the midpoint carries a soft save CTA when appropriate.
M: final single-action CTA

### 10 slides

1. Hook
2. Standalone context hook
3–8. Self-contained value/data/problem/solution slides
9. Summary or takeaway + soft save CTA
10. Final single-action CTA

These are structural rules, not permission to invent facts. The generated slide titles, research contexts, and CTA wording must remain grounded in the owner topic and approved research.

## Scope

### In Scope

- Change `slide_count` validation and schema to 5–10 with default 7.
- Update create/edit UI labels, slider, defaults, and helper text.
- Update synthesis schema and parser to generate the new role ordering.
- Make slide 2 explicitly standalone.
- Add a controlled soft save CTA in the middle/summary slide.
- Require one final CTA action on the last slide.
- Add deliberate `N/M` progress text to every generated slide prompt.
- Keep explicit exclusions for unrequested carousel/UI decoration.
- Add tests for 5, 7, and 10 slide structures and progress text.

### Out of Scope

- Any promise of algorithmic reach, engagement, saves, or completion-rate improvement.
- Numeric performance benchmarks from third-party sources.
- Video or mixed-media carousel items.
- Automatic posting, analytics, caption generation, comment-to-DM automation, or hashtags.
- Changing visual-command or platform-placement catalogs.
- Changing the per-post style-lock contract, except that the same lock continues across all slides.

## Success Criteria

- The owner can create and edit posts with 5–10 slides; new posts default to 7.
- Slide 1 is a hook, slide 2 is standalone, and the final slide is a single-action CTA.
- A soft save CTA appears once in the middle/summary position according to the selected slide count and does not replace the final CTA.
- Every prompt includes exact progress text `N/M`.
- Prompts explicitly exclude fake carousel dots and unrequested UI elements.
- All factual content still comes only from the approved research and owner topic.

## Risks

- A save CTA may be inappropriate for some topics. Mitigation: it is a soft reference-oriented prompt, and the output remains owner-reviewable.
- Forcing a fixed narrative into a topic with little research may create filler. Mitigation: require self-contained value and allow `custom`; never invent missing facts.
- Research sources are not official platform analytics. Mitigation: no benchmark or algorithm guarantee enters the spec.
- Changing the minimum from 3 to 5 invalidates existing posts. Mitigation: migration maps legacy slide counts below 5 to 5 and requires regeneration for the new structure; no existing prompt content is silently rewritten.
