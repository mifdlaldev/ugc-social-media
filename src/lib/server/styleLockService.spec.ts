import { describe, expect, it } from 'vitest';
import {
	STYLE_LOCK_MAX_LENGTH,
	STYLE_LOCK_MIN_LENGTH,
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
