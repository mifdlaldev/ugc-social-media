import { Elysia, t } from 'elysia';
import { requireOwner } from './auth';
import {
	createPreset,
	deletePreset,
	getPresetById,
	listActivePresets,
	listAllPresets,
	updatePreset
} from './presets';

const presetBody = t.Object({
	name: t.String({ minLength: 1, maxLength: 100 }),
	slug: t.Optional(t.String({ maxLength: 120 })),
	platform: t.String({ minLength: 1, maxLength: 60 }),
	aspect_ratio: t.String({ minLength: 1, maxLength: 10 }),
	language: t.Optional(t.String({ minLength: 2, maxLength: 10 })),
	visual_tone: t.Optional(t.String({ maxLength: 500 })),
	sort_order: t.Optional(t.Number())
});

const presetUpdateBody = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
	slug: t.Optional(t.String({ maxLength: 120 })),
	platform: t.Optional(t.String({ minLength: 1, maxLength: 60 })),
	aspect_ratio: t.Optional(t.String({ minLength: 1, maxLength: 10 })),
	language: t.Optional(t.String({ minLength: 2, maxLength: 10 })),
	visual_tone: t.Optional(t.String({ maxLength: 500 })),
	sort_order: t.Optional(t.Number()),
	is_active: t.Optional(t.Boolean())
});

export const presetsApi = new Elysia({ prefix: '/api' })
	.get('/presets', async ({ set }) => {
		set.status = 200;
		return await listActivePresets();
	})
	.get('/presets/all', async ({ request, set }) => {
		await requireOwner(request);
		set.status = 200;
		return await listAllPresets();
	})
	.get('/presets/:id', async ({ params, set }) => {
		const preset = await getPresetById(Number(params.id));
		if (!preset) {
			set.status = 404;
			return { error: 'Preset not found' };
		}
		set.status = 200;
		return preset;
	})
	.post(
		'/presets',
		async ({ request, body, set }) => {
			await requireOwner(request);
			const preset = await createPreset(body);
			set.status = 201;
			return preset;
		},
		{ body: presetBody }
	)
	.put(
		'/presets/:id',
		async ({ request, params, body, set }) => {
			await requireOwner(request);
			const existing = await getPresetById(Number(params.id));
			if (!existing) {
				set.status = 404;
				return { error: 'Preset not found' };
			}
			const updated = await updatePreset(
				existing.id,
				body as {
					name?: string;
					slug?: string;
					platform?: string;
					aspect_ratio?: string;
					language?: string;
					visual_tone?: string;
					is_active?: boolean;
					sort_order?: number;
				}
			);
			set.status = 200;
			return updated;
		},
		{ body: presetUpdateBody }
	)
	.delete('/presets/:id', async ({ request, params, set }) => {
		await requireOwner(request);
		const deleted = await deletePreset(Number(params.id));
		if (!deleted) {
			set.status = 404;
			return { error: 'Preset not found' };
		}
		set.status = 200;
		return { ok: true };
	});
