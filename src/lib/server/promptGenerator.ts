import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import { chatCompletion } from './llmClient';
import { synthesizeBriefs, type SlideBrief, type SynthesisResult } from './synthesisService';

export type Provider = 'gpt-image' | 'nano-banana' | 'recraft';
export type AspectRatio = '1:1' | '9:16' | '4:5' | '1.91:1' | '16:9' | '2:3';

export interface ProviderVariant {
	provider: Provider;
	prompt_text: string;
	visual_notes: string;
	on_image_text: string;
	aspect_ratio: AspectRatio;
}

export interface GeneratedSlide {
	slide_index: number;
	slide_type: SlideBrief['slide_type'];
	slide_title: string;
	slide_subtitle: string;
	slide_explanation: string;
	visual_labels: string;
	slide_takeaway: string;
	research_context: string;
	variants: ProviderVariant[];
}

/**
 * Shared prompt rules, applied to every provider variant.
 *
 * Both follow OpenAI's documented prompting guidance recorded in
 * docs/gpt-image-consistency-reference.md: quote literal text and treat typography
 * as a constraint, and state exclusions explicitly. Neither is a guarantee that a
 * provider will comply.
 */
const EXACT_TEXT_RULE =
	'EXACT TEXT: Render the quoted Indonesian text verbatim, with no translation, paraphrase, transliteration, or extra characters. Render it once and make it legible.';

const EXCLUSIONS_RULE =
	'EXCLUSIONS: No carousel dot indicators, page indicators, swipe arrows, application or browser interface, or device frames. No navigation arrows or interface imitation; diagrammatic or compositional arrows described in visual direction are allowed only as artwork, never as navigation. No decorative borders or ornamental frames; a structural composition frame described in visual direction is allowed as artwork. No watermarks, logos, signatures, or QR codes. No placeholder text or additional text beyond the specified artwork text. No paragraph or block of body copy, and no rendering of any line from the composition-context section.';

const LAYOUT_RULE =
	'LAYOUT: Plan the text zone, the subject zone, and the label anchors before rendering. Set the primary text as ONE block with a single shared alignment, a proportional usable width within its text band, balanced line lengths, and consistent line-height, so no large unused space is left beside it; break lines only where the wording allows and never alter, reorder, or reflow the characters themselves. Do not let a divider, colour field, or any split device cut through or strand the primary text block, and do not narrow that block into a thin column beside an empty field. Give every label the same badge treatment, padding, and alignment rhythm, and place each one beside the part it identifies. Keep all text, labels, and every labelled subject fully inside the canvas with a clear margin from each edge; a dominant labelled subject should fill its subject zone at a meaningful scale instead of being shrunk or centred uniformly just to stay inside the canvas; only unlabelled atmosphere or purely decorative elements may run off the edge. When the slide compares or pairs subjects, differentiate them by scale, angle, depth, overlap, elevation, or placement rather than rendering mirrored equal rivals, unless the slide meaning requires a symmetric diagram.';

/**
 * The style lock is inserted verbatim. Paraphrasing it would defeat its purpose:
 * every slide must carry byte-identical aesthetic direction. When empty the
 * block is omitted entirely so the slide prompt composes from the per-slide
 * visual notes and placement alone, without hallucinated style.
 */
function styleLockBlock(styleLock: string): string {
	if (styleLock.trim().length === 0) return '';
	return `STYLE LOCK — PRESERVE VERBATIM ACROSS ALL SLIDES:\n${styleLock}`;
}

/**
 * Section headings that split the prompt into text the artwork may show and text
 * the model may only read.
 *
 * An earlier build passed the explanation into the prompt without a boundary and
 * the model drew it as a paragraph, so the slide read as a document rather than an
 * infographic. Labelling the sections is prompt direction, not a guarantee that a
 * provider will comply.
 */
export const RENDER_SECTION_HEADING = 'RENDER IN ARTWORK — EXACT TEXT ONLY:';
export const CONTEXT_SECTION_HEADING = 'CONTEXT FOR COMPOSITION ONLY — DO NOT RENDER AS BODY COPY:';

function renderBlock(ctx: SlideContext): string {
	const lines = [RENDER_SECTION_HEADING, `Primary text: "${ctx.onImageText}"`];
	if (ctx.visualLabels.trim()) {
		lines.push(`Short labels placed beside the parts they identify: ${ctx.visualLabels}`);
	}
	lines.push('Render no other text.');
	return lines.join('\n');
}

/**
 * Teaching copy the model may read to understand the slide, but must not draw.
 *
 * An empty optional field is omitted rather than emitted as a blank label, which
 * would waste prompt space and could read as a missing value to the model.
 */
function contextBlock(ctx: SlideContext): string {
	const lines = [
		CONTEXT_SECTION_HEADING,
		`Topic: ${ctx.topic}`,
		`Slide type: ${ctx.slide_type}`,
		`Slide title: ${ctx.slide_title}`
	];
	if (ctx.slideSubtitle.trim()) lines.push(`Slide subtitle: ${ctx.slideSubtitle}`);
	lines.push(`Slide explanation: ${ctx.slideExplanation}`);
	if (ctx.slideTakeaway.trim()) lines.push(`Slide takeaway: ${ctx.slideTakeaway}`);
	if (ctx.research_context.trim()) lines.push(`Research context: ${ctx.research_context}`);
	lines.push(
		'Use the lines above to decide the visual concept only. They inform composition; they are not copy to draw.'
	);
	return lines.join('\n');
}

const PROVIDER_TEMPLATES: Record<Provider, (ctx: SlideContext) => string> = {
	'gpt-image': (
		ctx
	) => `${ctx.visualCommand} Create an image for ${ctx.placementLabel} (slide ${ctx.slide_index + 1} of ${ctx.slideCount}).
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
${renderBlock(ctx)}
Visual direction: ${ctx.visualNotes}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${contextBlock(ctx)}
${EXACT_TEXT_RULE}
${LAYOUT_RULE}
${EXCLUSIONS_RULE}
Render text accurately in Indonesian language. High contrast. Sharp edges.`,

	'nano-banana': (ctx) => `Create a photorealistic or stylized image for ${ctx.placementLabel}.
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
${renderBlock(ctx)}
Visual focus: ${ctx.visualNotes}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${contextBlock(ctx)}
${EXACT_TEXT_RULE}
${LAYOUT_RULE}
${EXCLUSIONS_RULE}
High quality, professional photography or 3D render style. Cinematic lighting.`,

	recraft: (ctx) => `Create a vector-style illustration for ${ctx.placementLabel}.
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Style: consistent brand illustration, icon-based, flat design
${renderBlock(ctx)}
Elements: ${ctx.visualNotes}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${contextBlock(ctx)}
${EXACT_TEXT_RULE}
${LAYOUT_RULE}
${EXCLUSIONS_RULE}
Color palette: limited 3-4 colors, brand-aligned. Clean lines, modern flat illustration.`
};

/**
 * Teaching copy for the visual-note stage, which is a text-model call rather than
 * an image prompt, so it carries no render boundary.
 */
function teachingLines(ctx: SlideContext): string {
	const lines = [`Slide title: ${ctx.slide_title}`];
	if (ctx.slideSubtitle.trim()) lines.push(`Slide subtitle: ${ctx.slideSubtitle}`);
	lines.push(`Slide explanation: ${ctx.slideExplanation}`);
	if (ctx.visualLabels.trim()) lines.push(`Visual labels: ${ctx.visualLabels}`);
	if (ctx.slideTakeaway.trim()) lines.push(`Slide takeaway: ${ctx.slideTakeaway}`);
	return lines.join('\n');
}

export const VISUAL_NOTES_SYSTEM_PROMPT = `You generate composition direction and the primary rendered text for one educational carousel slide.

You will receive a topic, target image placement, visual form, slide type, and the slide's teaching copy.
You must return a JSON object with exactly this shape:
{
  "visual_notes": string (max 220 chars, describes composition, layout, colors, focal point, and where labels sit),
  "on_image_text": string (max 120 chars, the primary text rendered ON the image)
}

Rules:
- visual_notes must follow the supplied visual form and be concrete and visual
- visual_notes must name one dominant focal point and state where it sits
- visual_notes must describe one deliberate editorial composition or visual concept for the slide (for example comparison split, diagonal tension, exploded arrangement, cutaway, framed vignette, layered stack, or process path) and the spatial relationship between the focal element and its supporting parts
- visual_notes must use at least one composition device when it suits the visual form: bold divider, colour field, diagonal division, diagrammatic arrow, callout line, frame, badge, drop shadow, texture field, overlap, varied scale, depth, or spatial rhythm
- visual_notes must place labels next to the components they identify, not in a separate legend, and give every label the same badge treatment, padding, and alignment rhythm
- visual_notes must allocate a text zone, a subject zone, and the label anchors, and set the primary text as one aligned block with proportional usable width within its text band and balanced line lengths so no large unused space is left beside it
- visual_notes must keep text-zone placement compatible with any divider, colour field, or split device; no device may cut through or strand the primary text block or narrow it beside an empty field
- visual_notes must keep every labelled subject, label, and the text fully inside the canvas with a clear edge margin; the dominant labelled subject must retain meaningful scale within its subject zone; only unlabelled atmosphere or purely decorative elements may run off the edge
- for comparison or paired-subject slides, visual_notes must create hierarchy or contrast through scale, angle, depth, overlap, elevation, or placement and must not default to mirrored equal rivals unless the slide meaning requires a symmetric diagram
- visual_notes must not default to a centred inventory grid, uniform tiles, a fixed 3x2 or 2x3 arrangement, or a headline-at-top catalogue sheet unless the selected visual form or slide meaning requires that arrangement; when a grid is required, still specify hierarchy, contrast, or another deliberate art-direction choice
- visual_notes must not add engineering facts, numbers, materials, dimensions, standards, citations, or claims
- visual_notes may use an arrow only as a diagrammatic or compositional element that explains a relationship or process; never as a carousel navigation arrow or interface cue
- on_image_text is the ONLY primary text that will be drawn on the image, so it must stand on its own
- on_image_text must be Indonesian and must agree with the supplied slide title and explanation
- on_image_text must stay short enough to render legibly at small size; never copy the whole explanation into it
- on_image_text may be a short sentence when that reads more clearly than a fragment
- Write on_image_text in natural Indonesian creator voice; address the viewer as "kamu" when it addresses the viewer
- Avoid report-like attribution, textbook framing, repeated question-shaped hooks, and staccato three-item slogans
- Preserve any qualifier from the supplied copy exactly; never turn an approximate figure into an exact one
- Do not invent any factual content absent from the supplied topic, teaching copy, or research context
- Do not claim first-person experience, a site visit, a project, or a personal observation not supplied by the owner
- Return ONLY the JSON object, no markdown`;

export interface SlideContext {
	topic: string;
	placementLabel: string;
	visualCommand: string;
	visualCommandDescription: string;
	slide_type: string;
	slide_title: string;
	slideSubtitle: string;
	slideExplanation: string;
	visualLabels: string;
	slideTakeaway: string;
	research_context: string;
	slide_index: number;
	slideCount: number;
	width: number;
	height: number;
	aspectRatio: AspectRatio;
	visualNotes: string;
	onImageText: string;
	/** Verbatim aesthetic specification shared by every slide of the post. */
	styleLock: string;
}

export function buildProviderPrompt(provider: Provider, context: SlideContext): string {
	return PROVIDER_TEMPLATES[provider](context);
}

export interface GenerateResult {
	synthesis: SynthesisResult;
	slides: GeneratedSlide[];
}

/**
 * Gap between per-slide calls. The free tier allows a limited number of requests
 * per minute, and one carousel issues a synthesis call plus one call per slide
 * back to back, so pacing the loop keeps a normal run under the limit instead of
 * relying on the client's retry path.
 */
export const SLIDE_CALL_SPACING_MS = 1200;

export async function generateSlides(
	topic: string,
	researchBrief: string,
	platformPlacement: string,
	visualCommand: string,
	slideCount: number,
	styleLock: string
): Promise<GenerateResult> {
	const placement = findPlatformPlacement(platformPlacement);
	const command = findVisualCommand(visualCommand);
	if (!placement) throw new Error('INVALID_PLATFORM_PLACEMENT');
	if (!command) throw new Error('INVALID_VISUAL_COMMAND');
	// styleLock may be empty when the owner disables the style lock (creative mode).
	// The prompt templates omit the STYLE LOCK block entirely for an empty value,
	// so per-slide visual notes + placement remain the only direction.

	const synthesis = await synthesizeBriefs(
		topic,
		researchBrief,
		platformPlacement,
		visualCommand,
		slideCount
	);

	// Build all slide contexts first, then run visual notes in parallel.
	// Each slide consumes ~500 tokens and the gateway is slow for reasoning
	// models, so parallel execution cuts wall-time from N sequential calls
	// to a single batch.
	const contexts: SlideContext[] = synthesis.slides.map((brief) => ({
		topic,
		placementLabel: `${placement.platform} ${placement.placement}`,
		visualCommand: command.value,
		visualCommandDescription: command.description,
		slide_type: brief.slide_type,
		slide_title: brief.slide_title,
		slideSubtitle: brief.slide_subtitle,
		slideExplanation: brief.slide_explanation,
		visualLabels: brief.visual_labels,
		slideTakeaway: brief.slide_takeaway,
		research_context: brief.research_context,
		slide_index: brief.slide_index,
		slideCount: synthesis.slides.length,
		width: placement.width,
		height: placement.height,
		aspectRatio: placement.ratio as AspectRatio,
		visualNotes: '',
		onImageText: '',
		styleLock
	}));

	const visualResults = await Promise.all(
		contexts.map((ctx) => buildVisualNotes(ctx))
	);

	const slides: GeneratedSlide[] = contexts.map((ctx, i) => {
		const brief = synthesis.slides[i];
		ctx.visualNotes = visualResults[i].visual_notes;
		ctx.onImageText = visualResults[i].on_image_text;

		const variants: ProviderVariant[] = (['gpt-image', 'nano-banana', 'recraft'] as Provider[]).map(
			(provider) => ({
				provider,
				prompt_text: buildProviderPrompt(provider, ctx),
				visual_notes: visualResults[i].visual_notes,
				on_image_text: visualResults[i].on_image_text,
				aspect_ratio: ctx.aspectRatio
			})
		);

		return {
			slide_index: brief.slide_index,
			slide_type: brief.slide_type,
			slide_title: brief.slide_title,
			slide_subtitle: brief.slide_subtitle,
			slide_explanation: brief.slide_explanation,
			visual_labels: brief.visual_labels,
			slide_takeaway: brief.slide_takeaway,
			research_context: brief.research_context,
			variants
		};
	});

	return { synthesis, slides };
}

async function buildVisualNotes(
	ctx: SlideContext
): Promise<{ visual_notes: string; on_image_text: string }> {
	const userMessage = `Topic: ${ctx.topic}
Target placement: ${ctx.placementLabel}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Slide type: ${ctx.slide_type}
${teachingLines(ctx)}
Research context: ${ctx.research_context}
Slide position: ${ctx.slide_index + 1} of ${ctx.slideCount}

Generate visual notes and on-image text for this slide. Return JSON only.`;

	const content = await chatCompletion(
		[
			{ role: 'system', content: VISUAL_NOTES_SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 300, temperature: 0.7 }
	);

	const json = extractJson(content);
	const parsed = JSON.parse(json) as {
		visual_notes?: string;
		on_image_text?: string;
	};

	return {
		visual_notes: parsed.visual_notes ?? `Visual for ${ctx.slide_type}: ${ctx.slide_title}`,
		on_image_text: parsed.on_image_text ?? ctx.slide_title
	};
}

function extractJson(content: string): string {
	const trimmed = content.trim();
	if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
	const match = trimmed.match(/\{[\s\S]*\}/);
	if (!match) throw new Error('VISUAL_NOTES_NO_JSON');
	return match[0];
}
