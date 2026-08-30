import { describe, expect, it } from 'vitest';
import { PLATFORM_PLACEMENTS } from '$lib/catalog/platformPlacements';
import { provider_variants } from '../../../drizzle/schema';

/**
 * The stored aspect_ratio enum must be able to hold every ratio the placement
 * catalog can produce. Without this, selecting a placement would generate a
 * prompt the database then refuses to store.
 */
describe('aspect ratio coverage', () => {
	it('accepts every ratio present in the placement catalog', () => {
		const allowed = provider_variants.aspect_ratio.enumValues as readonly string[];
		const catalogRatios = [...new Set(PLATFORM_PLACEMENTS.map((p) => p.ratio))];

		for (const ratio of catalogRatios) {
			expect(allowed, `ratio ${ratio} is missing from the provider_variants enum`).toContain(ratio);
		}
	});

	it('exposes the ratios the catalog actually uses', () => {
		const catalogRatios = [...new Set(PLATFORM_PLACEMENTS.map((p) => p.ratio))].sort();
		expect(catalogRatios).toEqual(['1.91:1', '16:9', '1:1', '2:3', '4:5', '9:16']);
	});
});
