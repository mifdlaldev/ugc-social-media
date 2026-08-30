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
	research_context: string;
	variants: ProviderVariant[];
}

const PROVIDER_TEMPLATES: Record<Provider, (ctx: SlideContext) => string> = {
	'gpt-image': (
		ctx
	) => `Create an image for ${ctx.placementLabel} (slide ${ctx.slide_index + 1} of ${ctx.slideCount}).
Topic: ${ctx.topic}
Slide type: ${ctx.slide_type}
Slide title: ${ctx.slide_title}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
On-image text: "${ctx.onImageText}"
Visual direction: ${ctx.visualNotes}
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
Render text accurately in Indonesian language. High contrast. Sharp edges.`,

	'nano-banana': (ctx) => `Create a photorealistic or stylized image for ${ctx.placementLabel}.
Topic: ${ctx.topic}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Visual focus: ${ctx.visualNotes}
On-image text: "${ctx.onImageText}" (minimal text overlay)
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
High quality, professional photography or 3D render style. Cinematic lighting.`,

	recraft: (ctx) => `Create a vector-style illustration for ${ctx.placementLabel}.
Topic: ${ctx.topic}
Visual form: ${ctx.visualCommand} — ${ctx.visualCommandDescription}
Style: consistent brand illustration, icon-based, flat design
Elements: ${ctx.visualNotes}
Text overlay: "${ctx.onImageText}" in modern sans-serif
Target canvas: ${ctx.width}x${ctx.height} pixels, ${ctx.aspectRatio} aspect ratio
Color palette: limited 3-4 colors, brand-aligned. Clean lines, modern flat illustration.`
};

const SYSTEM_PROMPT = `You generate per-provider visual notes and on-image text for social media carousel slides.

You will receive a topic, target image placement, visual form, slide type, slide title, and research context.
You must return a JSON object with exactly this shape:
{
  "visual_notes": string (max 200 chars, describes composition, colors, style, focal point),
  "on_image_text": string (max 80 chars, the text rendered ON the image itself)
}

Rules:
- visual_notes must follow the supplied visual form and be concrete and visual (composition, colors, style, focal element)
- visual_notes must not add engineering facts, numbers, materials, dimensions, standards, citations, or claims
- on_image_text should be short, punchy, in Indonesian
- on_image_text must be a key phrase, NOT a full sentence
- For hook slide: on_image_text should be the hook from the supplied context
- For cta slide: on_image_text should be the call to action from the supplied context
- For data slide: on_image_text should be the key data point from the supplied context
- Do not invent any factual content absent from the topic and research context
- Return ONLY the JSON object, no markdown`;

interface SlideContext {
	topic: string;
	placementLabel: string;
	visualCommand: string;
	visualCommandDescription: string;
	slide_type: string;
	slide_title: string;
	research_context: string;
	slide_index: number;
	slideCount: number;
	width: number;
	height: number;
	aspectRatio: AspectRatio;
	visualNotes: string;
	onImageText: string;
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
	slideCount: number
): Promise<GenerateResult> {
	const placement = findPlatformPlacement(platformPlacement);
	const command = findVisualCommand(visualCommand);
	if (!placement) throw new Error('INVALID_PLATFORM_PLACEMENT');
	if (!command) throw new Error('INVALID_VISUAL_COMMAND');

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
			research_context: brief.research_context,
			slide_index: brief.slide_index,
			slideCount: synthesis.slides.length,
			width: placement.width,
			height: placement.height,
			aspectRatio: placement.ratio as AspectRatio,
			visualNotes: '',
			onImageText: ''
		};

		const visualData = await buildVisualNotes(ctx);
		ctx.visualNotes = visualData.visual_notes;
		ctx.onImageText = visualData.on_image_text;

		const variants: ProviderVariant[] = (['gpt-image', 'nano-banana', 'recraft'] as Provider[]).map(
			(provider) => ({
				provider,
				prompt_text: PROVIDER_TEMPLATES[provider](ctx),
				visual_notes: visualData.visual_notes,
				on_image_text: visualData.on_image_text,
				aspect_ratio: ctx.aspectRatio
			})
		);

		slides.push({
			slide_index: brief.slide_index,
			slide_type: brief.slide_type,
			slide_title: brief.slide_title,
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
Slide title: ${ctx.slide_title}
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
