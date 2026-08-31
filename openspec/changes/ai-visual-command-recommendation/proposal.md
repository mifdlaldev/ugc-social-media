# Proposal: AI Visual Command Recommendation

## Context

A post currently carries one `visual_command` that the owner picks manually from an 18-item catalog. That single command is sent unchanged to every slide of the carousel.

The owner tested a post titled "Bata merah vs bata ringan" with `/infographic` selected. Every slide came back with the same centred-object layout. The catalog already contains `/comparison`, described in `docs/prompt-command-reference.md` as "Perbandingan berdampingan (side-by-side)", which fits an A-versus-B topic more closely than `/infographic` ("Tata letak infografis").

Nothing in the product helps the owner make that choice. The dropdown lists 18 commands with catalog descriptions and no guidance about which suits the topic at hand.

## Problem

- The owner must know all 18 commands and infer which one fits a topic. The catalog descriptions state what a command does, not when to choose it.
- One command is applied to all slides even when slide roles differ. A hook, a comparison of two materials, and a three-step CTA do not call for the same visual form.
- A poor command choice weakens every downstream stage, because the command appears in the synthesis instruction, the style-lock instruction, and as the leading token of the GPT Image prompt.

## Solution

Add a recommendation step that runs after research is approved and before prompt generation.

The recommendation service receives the topic and the approved research brief. It returns:

- a **primary command** chosen from the approved catalog, with a short reason that cites the topic or the research;
- up to two **alternative commands**, each with a reason;
- an optional **per-slide command plan**, one catalog command per slide index, with a short reason each.

The owner reviews the recommendation in the UI, below the existing command select. The owner may accept the primary command, accept a per-slide plan, pick an alternative, or ignore the recommendation entirely and keep their own choice. Nothing is applied without the owner's action.

The recommendation is advisory. The owner's selection remains the value used for generation.

### Constrained to the catalog

The service may only return `value` strings that exist in `src/lib/catalog/visualCommands.ts`. Any other value is rejected and the recommendation fails with a clear error rather than silently substituting a default.

### Reasons must be grounded

A reason may only refer to the supplied topic or the supplied research brief. It must not introduce an engineering fact, number, material property, standard, or claim. The recommendation explains a *visual form* choice; it is not a second channel for content.

## Scope

### In Scope

- A recommendation service that maps topic plus research to catalog commands with reasons.
- Validation that every returned command exists in the catalog.
- Persistence of the recommendation so the owner can revisit it without paying for a second model call.
- API routes to request and read a recommendation for a post.
- UI beneath the visual-command select showing the primary recommendation, its reason, alternatives, and the per-slide plan, each applicable by an explicit owner action.
- Tests for catalog-constrained parsing, rejection of unknown commands, and the advisory-only behaviour.

### Out of Scope

- Applying a recommendation automatically. The owner always decides.
- Changing the 18-command catalog, its values, or its descriptions.
- Adding a visual-identity or style-preset concept. That is a separate concern and belongs to its own change.
- Per-slide layout variation inside a single command. That is the separate defect recorded from the owner's design review and belongs to its own change.
- Changing the platform placement catalog, slide count, teaching fields, style lock, or the render boundary.
- Any claim that a recommended command guarantees a better image. A command states a visual direction; the provider's compliance is not guaranteed.

## Success Criteria

- For an A-versus-B topic such as "Bata merah vs bata ringan", the service recommends a comparison-shaped command from the catalog rather than leaving the owner with an unguided default.
- Every recommended value exists in the catalog; an invented value causes a visible error, never a silent fallback.
- Each reason references the topic or the research brief and contains no new factual claim.
- The owner can generate with their own choice while ignoring the recommendation.
- Existing generate behaviour is unchanged when no recommendation is requested.

## Risks

- The model may recommend a plausible-sounding command that does not fit. Mitigation: show the reason, offer alternatives, and keep the owner's choice authoritative.
- The model may return a command outside the catalog. Mitigation: hard validation against the catalog with a failing error.
- A reason could smuggle in a factual claim. Mitigation: state the prohibition in the instruction and keep reasons short and about visual form.
- Per-slide plans could conflict with the single stored `visual_command`. Mitigation: treat the per-slide plan as a separate stored artifact; do not change the existing single-command contract in this change.
