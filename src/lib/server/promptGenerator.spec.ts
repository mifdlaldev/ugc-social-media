import { describe, expect, it } from 'vitest';
import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import {
	CONTEXT_SECTION_HEADING,
	RENDER_SECTION_HEADING,
	VISUAL_NOTES_SYSTEM_PROMPT,
	buildProviderPrompt,
	type AspectRatio,
	type Provider,
	type SlideContext
} from './promptGenerator';

const PROVIDERS: Provider[] = ['gpt-image', 'nano-banana', 'recraft'];

const STYLE_LOCK_FIXTURE = [
	'MEDIUM: flat vector editorial illustration.',
	'PALETTE: deep navy, warm terracotta, off-white, one amber accent.',
	'TYPOGRAPHY: geometric sans, heavy headings, light labels.',
	'SHAPE LANGUAGE: 2px strokes, square corners, solid icons.',
	'BACKGROUND: off-white, generous negative space.',
	'CONSISTENCY: identical palette, stroke weight, and type scale on every slide.'
].join('\n');

function contextFor(placementValue: string, commandValue: string): SlideContext {
	const placement = findPlatformPlacement(placementValue);
	const command = findVisualCommand(commandValue);
	if (!placement) throw new Error(`unknown placement in fixture: ${placementValue}`);
	if (!command) throw new Error(`unknown command in fixture: ${commandValue}`);

	return {
		topic: 'Bata merah vs bata ringan',
		placementLabel: `${placement.platform} ${placement.placement}`,
		visualCommand: command.value,
		visualCommandDescription: command.description,
		slide_type: 'hook',
		slide_title: 'Bata Merah vs Bata Ringan',
		slideSubtitle: 'Perbandingan untuk dinding non-struktural',
		slideExplanation:
			'Bata merah dibakar dari tanah lempung, sedangkan bata ringan dicetak dari campuran berpori.',
		visualLabels: 'bata merah | bata ringan | arah beban',
		slideTakeaway: 'Pilih material sesuai kebutuhan beban dan waktu pasang.',
		research_context: 'context from approved research',
		slide_index: 0,
		slideCount: 5,
		width: placement.width,
		height: placement.height,
		aspectRatio: placement.ratio as AspectRatio,
		visualNotes: 'Split composition with a bold centre divider.',
		onImageText: 'Mana Jawaranya?',
		styleLock: STYLE_LOCK_FIXTURE
	};
}

describe('gpt-image prompt prefix', () => {
	it('starts with the selected visual command token', () => {
		const ctx = contextFor('instagram-feed-square', '/infographic');
		const prompt = buildProviderPrompt('gpt-image', ctx);
		expect(prompt.startsWith('/infographic ')).toBe(true);
	});

	it('uses the command the post selected, not a fixed default', () => {
		const ctx = contextFor('pinterest-standard-pin', '/cutaway');
		expect(buildProviderPrompt('gpt-image', ctx).startsWith('/cutaway ')).toBe(true);
	});

	it('still carries the labelled visual-form line', () => {
		const ctx = contextFor('instagram-feed-square', '/blueprint');
		const prompt = buildProviderPrompt('gpt-image', ctx);
		expect(prompt).toContain('Visual form: /blueprint — Cetak biru teknis (technical blueprint)');
	});

	it('does not claim the token is a native provider command', () => {
		const prompt = buildProviderPrompt(
			'gpt-image',
			contextFor('instagram-feed-square', '/diagram')
		);
		expect(prompt.toLowerCase()).not.toContain('native command');
		expect(prompt.toLowerCase()).not.toContain('api command');
	});

	it('leaves the other providers without a leading token', () => {
		const ctx = contextFor('instagram-feed-square', '/infographic');
		expect(buildProviderPrompt('nano-banana', ctx).startsWith('/infographic')).toBe(false);
		expect(buildProviderPrompt('recraft', ctx).startsWith('/infographic')).toBe(false);
	});
});

describe('shared prompt rules', () => {
	const ctx = contextFor('instagram-feed-portrait', '/comparison');

	it('states the exclusions on every provider', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			expect(prompt, provider).toContain('EXCLUSIONS:');
			for (const excluded of [
				'carousel dot indicators',
				'page indicators',
				'swipe arrows',
				'application or browser interface',
				'device frames',
				'decorative borders or frames',
				'watermarks',
				'logos',
				'signatures',
				'QR codes',
				'placeholder text',
				'additional text',
				'paragraph or block of body copy',
				'rendering of any line from the composition-context section'
			]) {
				expect(prompt, `${provider} / ${excluded}`).toContain(excluded);
			}
		}
	});

	it('groups the exclusions into separate sentences', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			const exclusions = prompt.slice(prompt.indexOf('EXCLUSIONS:'));
			expect(exclusions.split('. ').length, provider).toBeGreaterThan(1);
		}
	});

	it('marks on-image text as verbatim on every provider', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			expect(prompt, provider).toContain('EXACT TEXT:');
			expect(prompt, provider).toContain('verbatim');
			expect(prompt, provider).toContain('no translation');
		}
	});

	it('quotes the on-image text so it is unambiguous', () => {
		for (const provider of PROVIDERS) {
			expect(buildProviderPrompt(provider, ctx), provider).toContain('"Mana Jawaranya?"');
		}
	});

	it('carries the exact canvas and ratio on every provider', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			expect(prompt, provider).toContain('1080x1350 pixels');
			expect(prompt, provider).toContain('4:5 aspect ratio');
		}
	});

	it('names the visual command on every provider', () => {
		for (const provider of PROVIDERS) {
			expect(buildProviderPrompt(provider, ctx), provider).toContain('/comparison');
		}
	});

	it('keeps provider-specific direction distinct', () => {
		expect(buildProviderPrompt('gpt-image', ctx)).toContain('Render text accurately');
		expect(buildProviderPrompt('nano-banana', ctx)).toContain('Cinematic lighting');
		expect(buildProviderPrompt('recraft', ctx)).toContain('vector-style illustration');
	});
});

describe('render boundary', () => {
	const ctx = contextFor('instagram-feed-portrait', '/comparison');

	it('carries both labelled sections on every provider', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			expect(prompt, provider).toContain(RENDER_SECTION_HEADING);
			expect(prompt, provider).toContain(CONTEXT_SECTION_HEADING);
		}
	});

	it('names the exact primary text inside the render section', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			const renderPart = prompt.slice(
				prompt.indexOf(RENDER_SECTION_HEADING),
				prompt.indexOf(CONTEXT_SECTION_HEADING)
			);
			expect(renderPart, provider).toContain('Primary text: "Mana Jawaranya?"');
			expect(renderPart, provider).toContain('Render no other text.');
		}
	});

	it('keeps the explanation inside the context section, never the render section', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			const renderPart = prompt.slice(
				prompt.indexOf(RENDER_SECTION_HEADING),
				prompt.indexOf(CONTEXT_SECTION_HEADING)
			);
			const contextPart = prompt.slice(prompt.indexOf(CONTEXT_SECTION_HEADING));
			expect(renderPart, provider).not.toContain('Bata merah dibakar');
			expect(contextPart, provider).toContain('Slide explanation: Bata merah dibakar');
		}
	});

	it('places the teaching fields in the context section', () => {
		for (const provider of PROVIDERS) {
			const contextPart = buildProviderPrompt(provider, ctx).slice(
				buildProviderPrompt(provider, ctx).indexOf(CONTEXT_SECTION_HEADING)
			);
			expect(contextPart, provider).toContain('Slide title: Bata Merah vs Bata Ringan');
			expect(contextPart, provider).toContain('Slide subtitle: Perbandingan untuk dinding');
			expect(contextPart, provider).toContain('Slide takeaway: Pilih material');
			expect(contextPart, provider).toContain('Research context: context from approved research');
		}
	});

	it('states that context lines are not copy to draw', () => {
		for (const provider of PROVIDERS) {
			expect(buildProviderPrompt(provider, ctx), provider).toContain('not copy to draw');
		}
	});

	it('excludes rendered body copy', () => {
		for (const provider of PROVIDERS) {
			const prompt = buildProviderPrompt(provider, ctx);
			expect(prompt, provider).toContain('No paragraph or block of body copy');
			expect(prompt, provider).toContain('no rendering of any line from the composition-context');
		}
	});

	it('renders labels only when the slide supplies them', () => {
		const withLabels = buildProviderPrompt('gpt-image', ctx);
		expect(withLabels).toContain('Short labels placed beside the parts they identify:');

		const sparse = { ...ctx, visualLabels: '' };
		expect(buildProviderPrompt('gpt-image', sparse)).not.toContain('Short labels placed beside');
	});

	it('omits optional context lines when their fields are empty', () => {
		const sparse = { ...ctx, slideSubtitle: '', slideTakeaway: '', research_context: '' };
		const prompt = buildProviderPrompt('gpt-image', sparse);
		expect(prompt).not.toContain('Slide subtitle:');
		expect(prompt).not.toContain('Slide takeaway:');
		expect(prompt).not.toContain('Research context:');
		// The lines that must always survive.
		expect(prompt).toContain('Slide title:');
		expect(prompt).toContain('Slide explanation:');
	});
});

describe('canvas resolution per placement', () => {
	it('uses each placement own canvas rather than a fixed size', () => {
		const pinterest = buildProviderPrompt(
			'gpt-image',
			contextFor('pinterest-standard-pin', '/timeline')
		);
		expect(pinterest).toContain('1000x1500 pixels');
		expect(pinterest).toContain('2:3 aspect ratio');

		const x = buildProviderPrompt('gpt-image', contextFor('x-instream-single-image', '/timeline'));
		expect(x).toContain('1200x675 pixels');
		expect(x).toContain('16:9 aspect ratio');
	});
});

describe('visual-note instruction', () => {
	it('states that on-image text is the only text drawn', () => {
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('the ONLY primary text that will be drawn');
	});

	it('keeps on-image text legible and short', () => {
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('short enough to render legibly');
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('never copy the whole explanation into it');
	});

	it('requires one dominant focal point in the notes', () => {
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('one dominant focal point');
	});

	it('carries the voice and honesty rules', () => {
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('natural Indonesian creator voice');
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('Do not claim first-person experience');
	});

	it('keeps qualifier preservation and the no-invention rule', () => {
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('Preserve any qualifier');
		expect(VISUAL_NOTES_SYSTEM_PROMPT).toContain('Do not invent any factual content');
	});

	it('carries no detector-evasion instruction', () => {
		const lowered = VISUAL_NOTES_SYSTEM_PROMPT.toLowerCase();
		expect(lowered).not.toContain('detector');
		expect(lowered).not.toContain('detection');
		expect(lowered).not.toContain('undetectable');
	});
});
