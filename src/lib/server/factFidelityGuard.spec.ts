import { describe, expect, it } from 'vitest';
import { checkFactFidelity } from './factFidelityGuard';

const article = [
	'Pondasi rakit digunakan pada tanah lunak.',
	'Tebal pelat pondasi 30 cm dari beton bertulang.',
	'Material baja BN S25 termasuk dalam kategori BJ-37.'
].join('\n');

const blocks = (content: Record<string, string>) => ({
	sourceSummary: 'Pondasi rakit.',
	blocks: Object.fromEntries(Object.entries(content).map(([k, v]) => [k, { content: v }]))
});

describe('fact-fidelity guard', () => {
	it('accepts content fully derived from the article', () => {
		const r = checkFactFidelity(
			article,
			blocks({ visualStyle: 'Infografis pondasi rakit bertulang' })
		);
		expect(r.ok).toBe(true);
	});

	it('rejects an invented material/quantity', () => {
		const r = checkFactFidelity(article, blocks({ visualStyle: 'Tebal pelat 60 cm' }));
		expect(r.ok).toBe(false);
	});

	it('accepts generic visual direction', () => {
		const r = checkFactFidelity(
			article,
			blocks({ visualStyle: 'Gaya visual minimalis dan bersih' })
		);
		expect(r.ok).toBe(true);
	});

	it('rejects a named term absent from the article', () => {
		const r = checkFactFidelity(article, blocks({ visualStyle: 'Referensi Menara Eiffel' }));
		expect(r.ok).toBe(false);
	});

	it('returns rejected tokens on failure', () => {
		const r = checkFactFidelity(
			article,
			blocks({ visualStyle: 'Rasio baja BN S25 dan Menara Eiffel' })
		);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.rejectedTokens).toContain('menara eiffel');
	});
});
