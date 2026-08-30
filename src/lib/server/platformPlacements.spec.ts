import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PLATFORM_PLACEMENT,
	PLATFORM_PLACEMENTS,
	PLATFORM_PLACEMENT_VALUES,
	PLACEMENT_SOURCE_STATUS_LABELS,
	findPlatformPlacement,
	isPlatformPlacement,
	placementLabel
} from './platformPlacements';

describe('platform placement catalog', () => {
	it('contains exactly the 13 approved single-image placements', () => {
		expect(PLATFORM_PLACEMENTS).toHaveLength(13);
	});

	it('has no duplicate values', () => {
		expect(new Set(PLATFORM_PLACEMENT_VALUES).size).toBe(PLATFORM_PLACEMENT_VALUES.length);
	});

	it('contains the approved placement values in the documented order', () => {
		expect(PLATFORM_PLACEMENT_VALUES).toEqual([
			'instagram-feed-square',
			'instagram-feed-portrait',
			'instagram-feed-landscape',
			'instagram-stories',
			'facebook-feed-square',
			'facebook-feed-portrait',
			'facebook-stories',
			'x-instream-single-image',
			'youtube-community-image',
			'linkedin-single-image-portrait',
			'linkedin-single-image-square',
			'linkedin-single-image-landscape',
			'pinterest-standard-pin'
		]);
	});

	it('has valid source provenance on every entry', () => {
		for (const placement of PLATFORM_PLACEMENTS) {
			expect(placement.sourceUrl).toMatch(/^https:\/\//);
			expect(placement.sourceStatus in PLACEMENT_SOURCE_STATUS_LABELS).toBe(true);
			expect(placement.sourceStatus).not.toBe('');
		}
	});

	it('has positive dimensions and a non-empty ratio on every entry', () => {
		for (const placement of PLATFORM_PLACEMENTS) {
			expect(placement.width).toBeGreaterThan(0);
			expect(placement.height).toBeGreaterThan(0);
			expect(placement.ratio.trim().length).toBeGreaterThan(0);
		}
	});

	it('matches the approved exact canvases and ratios', () => {
		expect(findPlatformPlacement('instagram-feed-square')).toMatchObject({
			width: 1080,
			height: 1080,
			ratio: '1:1'
		});
		expect(findPlatformPlacement('instagram-feed-portrait')).toMatchObject({
			width: 1080,
			height: 1350,
			ratio: '4:5'
		});
		expect(findPlatformPlacement('instagram-feed-landscape')).toMatchObject({
			width: 1080,
			height: 566,
			ratio: '1.91:1'
		});
		expect(findPlatformPlacement('instagram-stories')).toMatchObject({
			width: 1080,
			height: 1920,
			ratio: '9:16'
		});
		expect(findPlatformPlacement('facebook-feed-square')).toMatchObject({
			width: 1080,
			height: 1080,
			ratio: '1:1'
		});
		expect(findPlatformPlacement('facebook-feed-portrait')).toMatchObject({
			width: 1080,
			height: 1350,
			ratio: '4:5'
		});
		expect(findPlatformPlacement('facebook-stories')).toMatchObject({
			width: 1080,
			height: 1920,
			ratio: '9:16'
		});
		expect(findPlatformPlacement('x-instream-single-image')).toMatchObject({
			width: 1200,
			height: 675,
			ratio: '16:9'
		});
		expect(findPlatformPlacement('youtube-community-image')).toMatchObject({
			width: 1080,
			height: 1080,
			ratio: '1:1'
		});
		expect(findPlatformPlacement('linkedin-single-image-portrait')).toMatchObject({
			width: 1080,
			height: 1350,
			ratio: '4:5'
		});
		expect(findPlatformPlacement('linkedin-single-image-square')).toMatchObject({
			width: 1080,
			height: 1080,
			ratio: '1:1'
		});
		expect(findPlatformPlacement('linkedin-single-image-landscape')).toMatchObject({
			width: 1200,
			height: 628,
			ratio: '1.91:1'
		});
		expect(findPlatformPlacement('pinterest-standard-pin')).toMatchObject({
			width: 1000,
			height: 1500,
			ratio: '2:3'
		});
	});

	it('keeps undocumented placements out of the catalog', () => {
		for (const excluded of [
			'threads-feed',
			'whatsapp-status',
			'kaskus-thread-image',
			'tiktok-photo-post',
			'facebook-feed-landscape',
			'youtube-thumbnail'
		]) {
			expect(isPlatformPlacement(excluded)).toBe(false);
			expect(findPlatformPlacement(excluded)).toBeUndefined();
		}
	});

	it('uses a catalog placement as the default', () => {
		expect(isPlatformPlacement(DEFAULT_PLATFORM_PLACEMENT)).toBe(true);
	});

	it('formats an option label with platform, placement, canvas, and ratio', () => {
		const placement = findPlatformPlacement('instagram-feed-portrait');
		expect(placement).toBeDefined();
		expect(placementLabel(placement!)).toBe('Instagram — Feed — Portrait · 1080×1350 · 4:5');
	});

	it('keeps undocumented file limits distinct from numeric limits', () => {
		expect(findPlatformPlacement('facebook-feed-square')?.fileSizeLimit).toBeNull();
		expect(findPlatformPlacement('pinterest-standard-pin')?.fileSizeLimit).toBe(
			'20 MB desktop; 32 MB in-app'
		);
	});
});
