import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import { chatCompletion } from './openRouterClient';
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
	'EXCLUSIONS: No carousel dot indicators, page indicators, swipe arrows, application or browser interface, device frames, decorative borders or frames, watermarks, logos, signatures, QR codes, placeholder text, or additional text.';

/**
 * The style lock is inserted verbatim. Paraphrasing it would defeat its purpose:
 * every slide must carry byte-identical aesthetic direction.
 */
function styleLockBlock(styleLock: string): string {
	return `STYLE LOCK — PRESERVE VERBATIM ACROSS ALL SLIDES:\n${styleLock}`;
}

/**
 * Teaching copy as separate labelled lines. An empty optional field is omitted
 * rather than emitted as a blank label, which would waste prompt space and could
 * read as a missing value to the model.
 */
function teachingBlock(ctx: SlideContext): string {
	const lines = [`Slide title: ${ctx.slide_title}`];
	if (ctx.slideSubtitle.trim()) lines.push(`Slide subtitle: ${ctx.slideSubtitle}`);
	lines.push(`Slide explanation: ${ctx.slideExplanation}`);
	if (ctx.visualLabels.trim()) lines.push(`Visual labels: ${ctx.visualLabels}`);
	if (ctx.slideTakeaway.trim()) lines.push(`Slide takeaway: ${ctx.slideTakeaway}`);
	return lines.join('\n');
}

const PROVIDER_TEMPLATES: Record<Provider, (ctx: SlideContext) => string> = {
	'gpt-image': (
		ctx
	) => `${ctx.visualCommand} Create an image for ${ctx.placementLabel} (slide ${ctx.slide_index + 1} of ${ctx.slideCount}).
Topic: ${ctx.topic}
Slide type: ${ctx.slide_type}
${teachingBlock(ctx)}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
On-image text: "${ctx.onImageText}"
Visual direction: ${ctx.visualNotes}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${EXACT_TEXT_RULE}
${EXCLUSIONS_RULE}
Render text accurately in Indonesian language. High contrast. Sharp edges.`,

	'nano-banana': (ctx) => `Create a photorealistic or stylized image for ${ctx.placementLabel}.
Topic: ${ctx.topic}
${teachingBlock(ctx)}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Visual focus: ${ctx.visualNotes}
On-image text: "${ctx.onImageText}" (minimal text overlay)
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${EXACT_TEXT_RULE}
${EXCLUSIONS_RULE}
High quality, professional photography or 3D render style. Cinematic lighting.`,

	recraft: (ctx) => `Create a vector-style illustration for ${ctx.placementLabel}.
Topic: ${ctx.topic}
${teachingBlock(ctx)}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Style: consistent brand illustration, icon-based, flat design
Elements: ${ctx.visualNotes}
Text overlay: "${ctx.onImageText}" in modern sans-serif
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
${styleLockBlock(ctx.styleLock)}
${EXACT_TEXT_RULE}
${EXCLUSIONS_RULE}
Color palette: limited 3-4 colors, brand-aligned. Clean lines, modern flat illustration.`
};

const SYSTEM_PROMPT = `You generate composition direction and the primary rendered text for one educational carousel slide.

You will receive a topic, target image placement, visual form, slide type, and the slide's teaching copy.
You must return a JSON object with exactly this shape:
{
  "visual_notes": string (max 220 chars, describes composition, layout, colors, focal point, and where labels sit),
  "on_image_text": string (max 120 chars, the primary text rendered ON the image)
}

Rules:
- visual_notes must follow the supplied visual form and be concrete and visual
- visual_notes must place labels next to the components they identify, not in a separate legend
- visual_notes must not add engineering facts, numbers, materials, dimensions, standards, citations, or claims
- on_image_text must be Indonesian and must agree with the supplied slide title and explanation
- on_image_text may be a short sentence when that reads more clearly than a fragment; keep it legible at small size
- Preserve any qualifier from the supplied copy exactly; never turn an approximate figure into an exact one
- Do not invent any factual content absent from the supplied topic, teaching copy, or research context
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
	if (styleLock.trim().length === 0) throw new Error('STYLE_LOCK_REQUIRED');

	const synthesis = await synthesizeBriefs(
		topic,
		researchBrief,
		platformPlacement,
		visualCommand,
		slideCount
	);
	const slides: GeneratedSlide[] = [];

	for (const brief of synthesis.slides) {
		const ctx: SlideContext = {
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
		};

		const visualData = await buildVisualNotes(ctx);
		ctx.visualNotes = visualData.visual_notes;
		ctx.onImageText = visualData.on_image_text;

		const variants: ProviderVariant[] = (['gpt-image', 'nano-banana', 'recraft'] as Provider[]).map(
			(provider) => ({
				provider,
				prompt_text: buildProviderPrompt(provider, ctx),
				visual_notes: visualData.visual_notes,
				on_image_text: visualData.on_image_text,
				aspect_ratio: ctx.aspectRatio
			})
		);

		slides.push({
			slide_index: brief.slide_index,
			slide_type: brief.slide_type,
			slide_title: brief.slide_title,
			slide_subtitle: brief.slide_subtitle,
			slide_explanation: brief.slide_explanation,
			visual_labels: brief.visual_labels,
			slide_takeaway: brief.slide_takeaway,
			research_context: brief.research_context,
			variants
		});
	}

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
${teachingBlock(ctx)}
Research context: ${ctx.research_context}
Slide position: ${ctx.slide_index + 1} of ${ctx.slideCount}

Generate visual notes and on-image text for this slide. Return JSON only.`;

	const content = await chatCompletion(
		[
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 500, temperature: 0.7 }
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
