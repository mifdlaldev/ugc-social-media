# Design: Calibrate Visual Constraints for Image Prompts

## Decision Summary

Adjust prompt wording, not product behavior or data model. Positive visual direction remains prominent; negative constraints stay limited to observed unrequested-output failures.

The implementation changes two existing constants:

- `STYLE_LOCK_SYSTEM_PROMPT` in `src/lib/server/styleLockService.ts`;
- `EXCLUSIONS_RULE` in `src/lib/server/promptGenerator.ts`.

No new service, field, endpoint, provider integration, or preset is introduced.

## Evidence Boundary

The change is based on observed output and repository evidence:

- `docs/owner-content-direction.md` records that the stronger observed result used technical/isometric treatment, a bright accent, and subtle grid ruling, while weaker results included muted palettes and flat/no-pattern backgrounds.
- `src/lib/server/styleLockService.ts` currently contains the style-lock requirements, including `generous safe space`, one focal point, one accent, and `no background patterns that fight the text`.
- `src/lib/server/promptGenerator.ts` currently contains one long `EXCLUSIONS_RULE` covering UI, branding, text, body copy, and context-rendering exclusions.
- `docs/gpt-image-consistency-reference.md` supports concrete medium, composition, typography, quoted text, and explicit exclusions. It does not establish deterministic provider behaviour.
- The exact generated prompts from earlier local DB backups were inspected during diagnosis. Those backups are not assumed to exist during implementation and are not a runtime dependency.

The change MUST NOT claim that a wording change guarantees image quality. External image generation remains stochastic.

## Prompt Changes

### Style-lock instruction

Keep the eight labelled aesthetic lines:

1. `MEDIUM`
2. `PALETTE`
3. `TYPOGRAPHY`
4. `FOCAL POINT`
5. `SHAPE LANGUAGE`
6. `BACKGROUND`
7. `CONTRAST`
8. `CONSISTENCY`

Keep these requirements:

- one dominant focal element per slide;
- exactly one high-contrast accent;
- bold display typography and scale hierarchy;
- readable safe space;
- no decorative clutter, ornamental flourishes, interface elements, or frames;
- aesthetic-only output and current factual-term validation.

Change wording as follows:

- Replace blanket prohibition of background patterns with permission for subtle grid, ruled texture, or constructive texture when compatible with the selected form and text legibility.
- Replace any fixed empty-space proportion or fixed empty-space position with readable safe space appropriate to each slide.
- State that focal position and composition can vary per slide; the style lock controls visual language, not one permanent layout.
- Do not prescribe orange, navy, a specific medium, or any other permanent palette/style.

The style-lock service continues to return one string and uses current parsing and `assertAestheticOnly` behavior.

### Shared provider exclusions

Replace long single-sentence wording with grouped sentences. Preserve all current categories:

- carousel dots, page indicators, swipe arrows, app/browser interface, and device frames;
- decorative borders/frames;
- watermarks, logos, signatures, and QR codes;
- placeholder text and additional text beyond specified artwork text;
- body-copy paragraphs and any rendering of composition-context lines.

This is wording restructuring only. It does not relax the render boundary or exact-text rule.

## Invariants

These remain unchanged:

- `RENDER IN ARTWORK — EXACT TEXT ONLY:` section;
- quoted `on_image_text` and explicitly supplied visual labels;
- `Render no other text.`;
- `CONTEXT FOR COMPOSITION ONLY — DO NOT RENDER AS BODY COPY:` section;
- exact-text rule and Indonesian rendering instruction;
- verbatim style-lock insertion across slides and providers;
- selected visual command prefix for GPT Image;
- target canvas and aspect ratio;
- provider set and provider-specific finishing instructions;
- aesthetic-only factual guard;
- article/research fact-fidelity boundary;
- no seed parameter, image generation, reference-image workflow, or provider guarantee.

## Testing

Add or update tests to assert:

- style-lock prompt still contains all eight labelled lines;
- style-lock prompt still requires one focal point, one high-contrast accent, bold display typography, and readable safe space;
- style-lock prompt permits subtle grid/ruled/constructive texture;
- style-lock prompt does not contain the blanket `no background patterns that fight the text` wording;
- style-lock prompt does not require fixed empty-space proportions or a fixed focal position across slides;
- `EXCLUSIONS_RULE` retains every current exclusion category in grouped sentences;
- all three provider prompts retain render/context headings, exact-text rule, exclusions, style lock, canvas, and ratio;
- `assertAestheticOnly` still rejects units, standards, prices, percentages, and durations;
- no source or test introduces provider guarantees, invented facts, a model ID, or a seed parameter.

Run:

```text
bun test --run
bun run check
bun run lint
openspec validate visual-style-calibration
```

Run existing pipeline smoke test if required environment variables are available. Do not call an external image provider from automated tests.

## Explicit Non-Decisions

- No fixed brand palette.
- No mandatory grid on every post or slide.
- No fixed focal position.
- No fixed empty-space percentage.
- No removal of exclusions that address observed UI, branding, or extra-text failures.
- No changes to article synthesis or research grounding.
- No claim that generated images will match the stronger observed batch.
