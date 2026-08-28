import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { prompt_presets } from '../../../drizzle/schema';

export const INITIAL_PRESETS = [
	{
		name: 'Instagram Post (1:1)',
		slug: 'instagram-post-1x1',
		platform: 'Instagram',
		aspect_ratio: '1:1',
		language: 'id',
		visual_tone: 'clean, bold, easy to read on a square feed image',
		sort_order: 1
	},
	{
		name: 'Instagram Story (9:16)',
		slug: 'instagram-story-9x16',
		platform: 'Instagram',
		aspect_ratio: '9:16',
		language: 'id',
		visual_tone: 'full-bleed vertical, minimal top and bottom safe margins',
		sort_order: 2
	},
	{
		name: 'Facebook Post (4:5)',
		slug: 'facebook-post-4x5',
		platform: 'Facebook',
		aspect_ratio: '4:5',
		language: 'id',
		visual_tone: 'portrait feed image, clear hierarchy, readable on mobile',
		sort_order: 3
	}
] as const;

export async function listActivePresets() {
	return db
		.select()
		.from(prompt_presets)
		.where(eq(prompt_presets.is_active, true))
		.orderBy(prompt_presets.sort_order, desc(prompt_presets.created_at));
}

export async function listAllPresets() {
	return db.select().from(prompt_presets).orderBy(prompt_presets.sort_order);
}

export async function getPresetById(id: number) {
	const [row] = await db.select().from(prompt_presets).where(eq(prompt_presets.id, id));
	return row ?? null;
}

export async function createPreset(data: {
	name: string;
	slug?: string;
	platform: string;
	aspect_ratio: string;
	language?: string;
	visual_tone?: string;
	sort_order?: number;
}) {
	const inserted = await db
		.insert(prompt_presets)
		.values({
			name: data.name,
			slug: data.slug ?? slugify(data.name),
			platform: data.platform,
			aspect_ratio: data.aspect_ratio,
			language: data.language ?? 'id',
			visual_tone: data.visual_tone ?? null,
			sort_order: data.sort_order ?? 0
		})
		.returning();
	return inserted[0];
}

export async function updatePreset(
	id: number,
	data: Partial<{
		name: string;
		slug: string;
		platform: string;
		aspect_ratio: string;
		language: string;
		visual_tone: string;
		is_active: boolean;
		sort_order: number;
	}>
) {
	const slug = data.slug ?? (data.name ? slugify(data.name) : undefined);
	const updated = await db
		.update(prompt_presets)
		.set({
			...data,
			slug,
			updated_at: new Date()
		})
		.where(eq(prompt_presets.id, id))
		.returning();
	return updated[0] ?? null;
}

export async function deletePreset(id: number) {
	const deleted = await db.delete(prompt_presets).where(eq(prompt_presets.id, id)).returning();
	return deleted[0] ?? null;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}
