import { chatCompletion } from './openRouterClient';
import { synthesizeBriefs, type SlideBrief, type SynthesisResult } from './synthesisService';

export type Provider = 'gpt-image' | 'nano-banana' | 'recraft';
export type AspectRatio = '1:1' | '9:16' | '4:5' | '1.91:1';

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

const ASPECT_BY_PLATFORM: Record<string, AspectRatio> = {
	instagram: '1:1',
	facebook: '4:5',
	linkedin: '1.91:1'
};

const PROVIDER_TEMPLATES: Record<Provider, (ctx: SlideContext) => string> = {
	'gpt-image': (
		ctx
	) => `Create an infographic for ${ctx.platform} carousel (slide ${ctx.slide_index + 1} of ${ctx.slideCount}).
Topic: ${ctx.topic}
Slide type: ${ctx.slide_type}
Slide title: ${ctx.slide_title}
On-image text: "${ctx.onImageText}"
Tone: ${ctx.tone}
Visual: ${ctx.visualNotes}
Composition: ${ctx.aspectRatio} aspect ratio
Style: clean infographic, bold typography, professional architecture/engineering
Render text accurately in Indonesian language. High contrast. Sharp edges.`,

	'nano-banana': (ctx) => `Photorealistic or stylized hero image for ${ctx.platform} post.
Topic: ${ctx.topic}
Mood: ${ctx.tone}
Visual focus: ${ctx.visualNotes}
Subtle text overlay: "${ctx.onImageText}" (minimal, let the image breathe)
Composition: ${ctx.aspectRatio}, vertical or square
High quality, professional photography or 3D render style. Cinematic lighting.`,

	recraft: (ctx) => `Vector-style illustration infographic for ${ctx.platform} post.
Topic: ${ctx.topic}
Style: consistent brand illustration, icon-based, flat design
Elements: ${ctx.visualNotes}
Text overlay: "${ctx.onImageText}" in modern sans-serif
Color palette: limited 3-4 colors, brand-aligned
Composition: ${ctx.aspectRatio}, clean lines, modern flat illustration.`
};

const SYSTEM_PROMPT = `You generate per-provider visual notes and on-image text for social media carousel slides.

You will receive a slide context (topic, slide type, slide title, research context).
You must return a JSON object with exactly this shape:
{
  "visual_notes": string (max 200 chars, describes composition, colors, style, focal point),
  "on_image_text": string (max 80 chars, the text rendered ON the image itself)
}

Rules:
- visual_notes must be concrete and visual (composition, colors, style, focal element)
- on_image_text should be short, punchy, in Indonesian
- on_image_text must be a key phrase, NOT a full sentence
- For hook slide: on_image_text should be the hook
- For cta slide: on_image_text should be the call to action
- For data slide: on_image_text should be the key data point
- Return ONLY the JSON object, no markdown`;

interface SlideContext {
	topic: string;
	platform: string;
	tone: string;
	slide_type: string;
	slide_title: string;
	research_context: string;
	slide_index: number;
	slideCount: number;
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
	platform: string,
	tone: string,
	slideCount: number
): Promise<GenerateResult> {
	const synthesis = await synthesizeBriefs(topic, researchBrief, platform, tone, slideCount);

	const aspectRatio = ASPECT_BY_PLATFORM[platform] ?? '1:1';
	const slides: GeneratedSlide[] = [];

	for (let i = 0; i < synthesis.slides.length; i++) {
		const brief = synthesis.slides[i] as SlideBrief;
		const ctx: SlideContext = {
			topic,
			platform,
			tone,
			slide_type: brief.slide_type,
			slide_title: brief.slide_title,
			research_context: brief.research_context,
			slide_index: brief.slide_index,
			slideCount: synthesis.slides.length,
			aspectRatio,
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
				aspect_ratio: aspectRatio
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
Platform: ${ctx.platform}
Tone: ${ctx.tone}
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
