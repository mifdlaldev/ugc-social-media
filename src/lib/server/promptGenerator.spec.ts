import { describe, expect, it } from 'vitest';
import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import {
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
				'device frames',
				'watermarks',
				'logos',
				'signatures',
				'QR codes',
				'placeholder text',
				'additional text'
			]) {
				expect(prompt, `${provider} / ${excluded}`).toContain(excluded);
			}
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
