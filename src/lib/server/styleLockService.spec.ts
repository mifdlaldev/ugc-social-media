import { describe, expect, it } from 'vitest';
import {
	STYLE_LOCK_MAX_LENGTH,
	STYLE_LOCK_MIN_LENGTH,
	STYLE_LOCK_SYSTEM_PROMPT,
	assertAestheticOnly,
	findFactualTerms,
	parseStyleLockResponse,
	validateStyleLockText
} from './styleLockService';

const AESTHETIC_ONLY = [
	'MEDIUM: flat vector editorial illustration, no photographic texture.',
	'PALETTE: deep navy, warm terracotta, off-white, one amber accent.',
	'TYPOGRAPHY: geometric sans, heavy headings, light labels.',
	'SHAPE LANGUAGE: even strokes, square corners, solid icons.',
	'BACKGROUND: off-white with generous negative space.',
	'CONSISTENCY: identical palette, stroke weight, and type scale on every slide.'
].join('\n');

describe('parseStyleLockResponse', () => {
	it('reads a plain JSON object', () => {
		const raw = JSON.stringify({ style_lock: AESTHETIC_ONLY });
		expect(parseStyleLockResponse(raw)).toBe(AESTHETIC_ONLY);
	});

	it('recovers text wrapped in a markdown fence', () => {
		const raw = '```json\n' + JSON.stringify({ style_lock: AESTHETIC_ONLY }) + '\n```';
		expect(parseStyleLockResponse(raw)).toBe(AESTHETIC_ONLY);
	});

	it('recovers text surrounded by prose', () => {
		const raw = `Here you go:\n${JSON.stringify({ style_lock: AESTHETIC_ONLY })}\nHope that helps.`;
		expect(parseStyleLockResponse(raw)).toBe(AESTHETIC_ONLY);
	});

	it('trims surrounding whitespace', () => {
		const raw = JSON.stringify({ style_lock: `  ${AESTHETIC_ONLY}  ` });
		expect(parseStyleLockResponse(raw)).toBe(AESTHETIC_ONLY);
	});

	it('fails rather than returning empty text', () => {
		expect(() => parseStyleLockResponse(JSON.stringify({ style_lock: '' }))).toThrow(
			'STYLE_LOCK_EMPTY'
		);
		expect(() => parseStyleLockResponse(JSON.stringify({ style_lock: '   ' }))).toThrow(
			'STYLE_LOCK_EMPTY'
		);
	});

	it('fails when the field is absent or not a string', () => {
		expect(() => parseStyleLockResponse(JSON.stringify({ other: 'x' }))).toThrow(
			'STYLE_LOCK_EMPTY'
		);
		expect(() => parseStyleLockResponse(JSON.stringify({ style_lock: 42 }))).toThrow(
			'STYLE_LOCK_EMPTY'
		);
	});

	it('fails when no JSON object is present', () => {
		expect(() => parseStyleLockResponse('no json at all')).toThrow('STYLE_LOCK_NO_JSON');
	});

	it('fails on malformed JSON rather than throwing a raw SyntaxError', () => {
		expect(() => parseStyleLockResponse('{ "style_lock": }')).toThrow('STYLE_LOCK_INVALID_JSON');
	});

	it('rejects output beyond the stored bound', () => {
		const raw = JSON.stringify({ style_lock: 'a'.repeat(STYLE_LOCK_MAX_LENGTH + 1) });
		expect(() => parseStyleLockResponse(raw)).toThrow('STYLE_LOCK_TOO_LONG');
	});
});

describe('factual-term detection', () => {
	it('accepts an aesthetic-only specification', () => {
		expect(findFactualTerms(AESTHETIC_ONLY)).toEqual([]);
		expect(() => assertAestheticOnly(AESTHETIC_ONLY)).not.toThrow();
	});

	it('flags a measurement with a unit', () => {
		expect(findFactualTerms('MEDIUM: flat vector, wall thickness 150 mm').length).toBeGreaterThan(
			0
		);
	});

	it('flags a named standard', () => {
		expect(findFactualTerms('PALETTE: colours per SNI 1234').length).toBeGreaterThan(0);
	});

	it('flags a price', () => {
		expect(findFactualTerms('BACKGROUND: off-white, budget Rp 800.000').length).toBeGreaterThan(0);
	});

	it('flags a duration', () => {
		expect(findFactualTerms('CONSISTENCY: curing shown over 28 hari').length).toBeGreaterThan(0);
	});

	it('rejects generated output that carries facts', () => {
		expect(() => assertAestheticOnly('MEDIUM: flat vector, slab 200 mm')).toThrow(
			'STYLE_LOCK_CONTAINS_FACTS'
		);
	});

	it('does not flag colour or typography wording that merely contains digits', () => {
		expect(findFactualTerms('TYPOGRAPHY: 2 weights only, headings and labels')).toEqual([]);
	});
});

describe('validateStyleLockText', () => {
	it('accepts owner text within bounds and trims it', () => {
		expect(validateStyleLockText(`  ${AESTHETIC_ONLY}  `)).toBe(AESTHETIC_ONLY);
	});

	it('rejects empty text', () => {
		expect(() => validateStyleLockText('')).toThrow('STYLE_LOCK_EMPTY');
		expect(() => validateStyleLockText('    ')).toThrow('STYLE_LOCK_EMPTY');
	});

	it('rejects text below the minimum length', () => {
		expect(() => validateStyleLockText('flat vector')).toThrow('STYLE_LOCK_TOO_SHORT');
	});

	it('accepts text exactly at the minimum length', () => {
		expect(validateStyleLockText('a'.repeat(STYLE_LOCK_MIN_LENGTH))).toHaveLength(
			STYLE_LOCK_MIN_LENGTH
		);
	});

	it('rejects text beyond the maximum length', () => {
		expect(() => validateStyleLockText('a'.repeat(STYLE_LOCK_MAX_LENGTH + 1))).toThrow(
			'STYLE_LOCK_TOO_LONG'
		);
	});

	it('does not reject owner text for containing facts', () => {
		// The owner's wording is authoritative. Only bounds are enforced here.
		const withNumber = `${AESTHETIC_ONLY}\nNOTE: keep the 150 mm detail legible.`;
		expect(() => validateStyleLockText(withNumber)).not.toThrow();
	});
});

describe('visual impact brief', () => {
	it('asks for a focal point, a contrast accent, and display typography', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('FOCAL POINT:');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('CONTRAST:');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('high-contrast accent');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('bold display treatment for headings');
	});

	it('rejects a low-contrast washed-out scheme', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('low-contrast');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('washed-out');
	});

	it('keeps the palette to one accent', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('Use exactly one accent');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('Do not expand the palette');
	});

	it('requires one dominant focal element and slide-appropriate safe space', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('one dominant focal element');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('generous safe space appropriate to each slide');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('let each slide determine the amount and placement');
	});

	it('allows constructive background texture without requiring it', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'subtle grid, ruled texture, or constructive texture'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('when text stays legible');
		expect(STYLE_LOCK_SYSTEM_PROMPT).not.toContain('no background patterns that fight the text');
		expect(STYLE_LOCK_SYSTEM_PROMPT).not.toContain('fixed empty-space proportion');
	});

	it('allows focal position and composition to vary by slide', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('position and composition may vary by slide');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('per-slide composition and focal position may vary');
	});

	it('forbids clutter and interface ornament', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('No decorative clutter');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('no interface elements');
	});

	it('asks for positive art direction, not only object treatment', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('Art direction rules:');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('editorial composition language');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('texture, depth, or surface treatment');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('visual rhythm');
	});

	it('names reusable composition devices in the shape language line', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('composition devices the set may reuse');
		for (const device of ['colour field', 'diagonal division', 'bold divider', 'callout line']) {
			expect(STYLE_LOCK_SYSTEM_PROMPT, device).toContain(device);
		}
	});

	it('rejects a catalogue-sheet result while staying a system, not a layout', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('rather than a catalogue sheet');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('reusable design system, not a fixed layout');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'Do not fix one arrangement, one grid, one focal position, or one named reference style'
		);
	});

	it('allows a diagrammatic arrow but no navigation arrow', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'An arrow is allowed only as a diagrammatic or compositional element, never as navigation'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('no carousel dots, page indicators, swipe arrows');
	});

	it('keeps the aesthetic-only rule intact alongside the impact rules', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('Aesthetic properties ONLY');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('named standard');
	});

	it('requires typography layout discipline', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('proportional usable width within the text band');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('balanced line lengths');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('consistent line-height and gap steps');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('one stable text-block alignment and label rhythm');
		expect(STYLE_LOCK_SYSTEM_PROMPT).not.toContain('controlled maximum measure');
	});

	it('keeps split devices away from the primary text block', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'must not cut through or strand the primary text block'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'do not leave an arbitrary void beside it caused by a decorative split'
		);
	});

	it('keeps dominant labelled subjects at meaningful scale', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'a dominant labelled subject fills its subject zone while staying inside that margin'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'Keep dominant labelled subjects meaningful in scale within their subject zones'
		);
	});

	it('rejects mirrored equal rivals for comparison slides', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('instead of becoming a mirrored equal rival');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('avoid mirrored equal rivals unless symmetry');
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain('requires a symmetric diagram');
	});

	it('separates structural framing from decorative borders', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'a structural composition frame is a composition device, never a decorative border or a device frame'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'A structural composition frame is allowed as artwork; decorative borders and device frames remain prohibited'
		);
	});

	it('keeps text, labels, and labelled subjects inside the canvas', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'text, labels, and every labelled subject stay inside the breathing margin'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'Keep every labelled subject and label fully visible inside the canvas with a clear edge buffer'
		);
	});

	it('limits edge cropping to unlabelled or decorative elements', () => {
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'only unlabelled atmosphere or purely decorative elements may be cropped at an edge'
		);
		expect(STYLE_LOCK_SYSTEM_PROMPT).toContain(
			'crop only unlabelled atmosphere or purely decorative elements'
		);
	});

	it('accepts a high-contrast specification that carries no facts', () => {
		const highContrast = [
			'MEDIUM: flat vector editorial illustration.',
			'PALETTE: deep slate base, off-white, one signal orange accent.',
			'TYPOGRAPHY: bold condensed uppercase headings, light sans labels.',
			'FOCAL POINT: one large sectioned element, upper third.',
			'SHAPE LANGUAGE: even strokes, square corners, solid icons.',
			'BACKGROUND: deep slate, generous negative space.',
			'CONTRAST: accent reads instantly against the slate base.',
			'CONSISTENCY: identical palette, stroke weight, and type scale on every slide.'
		].join('\n');
		expect(findFactualTerms(highContrast)).toEqual([]);
		expect(() => assertAestheticOnly(highContrast)).not.toThrow();
	});
});
