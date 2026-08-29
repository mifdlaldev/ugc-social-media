import { describe, expect, it } from 'vitest';
import { parsePromptOutput } from './promptParser';

const validResult = {
	schemaVersion: '1.0.0',
	sourceSummary: 'Artikel tentang pondasi bangunan.',
	blocks: {
		visualStyle: { id: 'visual-style', label: 'Visual style', content: 'Flat infographic' },
		composition: { id: 'composition', label: 'Composition', content: 'Balanced' },
		colorPalette: { id: 'color-palette', label: 'Color palette', content: 'Neutral' },
		typography: { id: 'typography', label: 'Typography', content: 'Sans-serif' },
		layout: { id: 'layout', label: 'Layout', content: 'Grid' },
		onImageText: { id: 'on-image-text', label: 'On-image text', content: 'Pondasi' },
		aspectRatio: { id: 'aspect-ratio', label: 'Aspect ratio', content: '1:1' },
		toolNotes: [
			{ id: 'note-1', label: 'GPT Image', content: 'Spell out text' },
			{ id: 'note-2', label: 'Nano Banana', content: 'Aspect ratio' }
		]
	},
	fidelityNotes: ['material unspecified']
};

describe('prompt output parser', () => {
	it('parses plain JSON', () => {
		const r = parsePromptOutput(JSON.stringify(validResult));
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.result.blocks.layout.content).toBe('Grid');
	});

	it('extracts JSON wrapped in markdown fences', () => {
		const wrapped = '```json\n' + JSON.stringify(validResult) + '\n```';
		const r = parsePromptOutput(wrapped);
		expect(r.ok).toBe(true);
	});

	it('extracts JSON embedded in surrounding prose', () => {
		const prose = 'Here is your prompt:\n' + JSON.stringify(validResult) + '\nGood luck!';
		const r = parsePromptOutput(prose);
		expect(r.ok).toBe(true);
	});

	it('rejects empty output', () => {
		const r = parsePromptOutput('');
		expect(r.ok).toBe(false);
	});

	it('rejects non-JSON prose', () => {
		const r = parsePromptOutput('This is not JSON at all, no braces here.');
		expect(r.ok).toBe(false);
	});

	it('rejects JSON missing required blocks', () => {
		const broken = { ...validResult, blocks: { ...validResult.blocks, onImageText: undefined } };
		delete (broken.blocks as Record<string, unknown>).onImageText;
		const r = parsePromptOutput(JSON.stringify(broken));
		expect(r.ok).toBe(false);
	});

	it('rejects schemaVersion mismatch', () => {
		const r = parsePromptOutput(JSON.stringify({ ...validResult, schemaVersion: '9.9.9' }));
		expect(r.ok).toBe(false);
	});

	it('rejects blocks with empty content', () => {
		const broken = structuredClone(validResult);
		broken.blocks.visualStyle.content = '';
		const r = parsePromptOutput(JSON.stringify(broken));
		expect(r.ok).toBe(false);
	});
});
