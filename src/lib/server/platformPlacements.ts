export type PlacementSourceStatus =
	'official' | 'official-ratio-derived-canvas' | 'official-ads-doc';

export interface PlatformPlacement {
	value: string;
	platform: string;
	placement: string;
	width: number;
	height: number;
	ratio: string;
	fileSizeLimit: string | null;
	sourceStatus: PlacementSourceStatus;
	sourceUrl: string;
}

export const PLATFORM_PLACEMENTS: readonly PlatformPlacement[] = [
	{
		value: 'instagram-feed-square',
		platform: 'Instagram',
		placement: 'Feed — Square',
		width: 1080,
		height: 1080,
		ratio: '1:1',
		fileSizeLimit: '8 MB (third-party)',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://help.instagram.com/1631821640426723?helpref=hc_fnav'
	},
	{
		value: 'instagram-feed-portrait',
		platform: 'Instagram',
		placement: 'Feed — Portrait',
		width: 1080,
		height: 1350,
		ratio: '4:5',
		fileSizeLimit: '8 MB (third-party)',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://help.instagram.com/1631821640426723?helpref=hc_fnav'
	},
	{
		value: 'instagram-feed-landscape',
		platform: 'Instagram',
		placement: 'Feed — Landscape',
		width: 1080,
		height: 566,
		ratio: '1.91:1',
		fileSizeLimit: '8 MB (third-party)',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://help.instagram.com/1631821640426723?helpref=hc_fnav'
	},
	{
		value: 'instagram-stories',
		platform: 'Instagram',
		placement: 'Stories',
		width: 1080,
		height: 1920,
		ratio: '9:16',
		fileSizeLimit: '30 MB (ads doc)',
		sourceStatus: 'official-ads-doc',
		sourceUrl: 'https://www.facebook.com/business/help/2222978001316177'
	},
	{
		value: 'facebook-feed-square',
		platform: 'Facebook',
		placement: 'Feed — Square',
		width: 1080,
		height: 1080,
		ratio: '1:1',
		fileSizeLimit: null,
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://www.facebook.com/business/help/469767027114079'
	},
	{
		value: 'facebook-feed-portrait',
		platform: 'Facebook',
		placement: 'Feed — Portrait',
		width: 1080,
		height: 1350,
		ratio: '4:5',
		fileSizeLimit: null,
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://www.facebook.com/business/help/469767027114079'
	},
	{
		value: 'facebook-stories',
		platform: 'Facebook',
		placement: 'Stories',
		width: 1080,
		height: 1920,
		ratio: '9:16',
		fileSizeLimit: '30 MB (ads doc)',
		sourceStatus: 'official-ads-doc',
		sourceUrl: 'https://www.facebook.com/business/help/2222978001316177'
	},
	{
		value: 'x-instream-single-image',
		platform: 'X',
		placement: 'In-stream single image',
		width: 1200,
		height: 675,
		ratio: '16:9',
		fileSizeLimit: '5 MB native; 20 MB Media Studio',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://help.x.com/en/using-x/posting-gifs-and-pictures'
	},
	{
		value: 'youtube-community-image',
		platform: 'YouTube',
		placement: 'Community post image',
		width: 1080,
		height: 1080,
		ratio: '1:1',
		fileSizeLimit: '16 MB',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://support.google.com/youtube/answer/7124474?hl=en&co=GENIE.Platform%3DDesktop'
	},
	{
		value: 'linkedin-single-image-portrait',
		platform: 'LinkedIn',
		placement: 'Single image — Portrait',
		width: 1080,
		height: 1350,
		ratio: '4:5',
		fileSizeLimit: '5 MB',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://www.linkedin.com/help/lms/answer/a527229'
	},
	{
		value: 'linkedin-single-image-square',
		platform: 'LinkedIn',
		placement: 'Single image — Square',
		width: 1080,
		height: 1080,
		ratio: '1:1',
		fileSizeLimit: '5 MB',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://www.linkedin.com/help/lms/answer/a527229'
	},
	{
		value: 'linkedin-single-image-landscape',
		platform: 'LinkedIn',
		placement: 'Single image — Landscape',
		width: 1200,
		height: 628,
		ratio: '1.91:1',
		fileSizeLimit: '5 MB',
		sourceStatus: 'official-ratio-derived-canvas',
		sourceUrl: 'https://www.linkedin.com/help/lms/answer/a527229'
	},
	{
		value: 'pinterest-standard-pin',
		platform: 'Pinterest',
		placement: 'Standard Pin',
		width: 1000,
		height: 1500,
		ratio: '2:3',
		fileSizeLimit: '20 MB desktop; 32 MB in-app',
		sourceStatus: 'official',
		sourceUrl: 'https://help.pinterest.com/en/business/article/pinterest-product-specs'
	}
] as const;

export const PLACEMENT_SOURCE_STATUS_LABELS: Record<PlacementSourceStatus, string> = {
	official: 'Spesifikasi resmi platform',
	'official-ratio-derived-canvas': 'Rasio resmi, kanvas turunan',
	'official-ads-doc': 'Dari dokumentasi iklan platform'
};

export const DEFAULT_PLATFORM_PLACEMENT = 'instagram-feed-portrait';
export const PLATFORM_PLACEMENT_VALUES = PLATFORM_PLACEMENTS.map((placement) => placement.value);

export const LEGACY_PLATFORM_PLACEMENT_MAP: Record<string, string> = {
	instagram: 'instagram-feed-square',
	facebook: 'facebook-feed-portrait',
	linkedin: 'linkedin-single-image-landscape'
};

export function findPlatformPlacement(value: string): PlatformPlacement | undefined {
	return PLATFORM_PLACEMENTS.find((placement) => placement.value === value);
}

export function isPlatformPlacement(value: string): boolean {
	return PLATFORM_PLACEMENTS.some((placement) => placement.value === value);
}

export function placementLabel(placement: PlatformPlacement): string {
	return `${placement.platform} — ${placement.placement} · ${placement.width}×${placement.height} · ${placement.ratio}`;
}
