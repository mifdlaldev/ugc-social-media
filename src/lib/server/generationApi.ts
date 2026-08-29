import { Elysia, t } from 'elysia';
import { requireOwner } from './auth';
import { db } from './db';
import { posts, prompt_presets } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { generatePrompt } from './promptGenerator';

export const generationApi = new Elysia({ prefix: '/api' }).post(
	'/posts/:id/generate',
	async ({ request, params, body, set }) => {
		await requireOwner(request);
		const post = await db
			.select()
			.from(posts)
			.where(eq(posts.id, Number(params.id)));
		const postRow = post[0];
		if (!postRow) {
			set.status = 404;
			return { error: 'Post not found' };
		}
		const preset = await db
			.select()
			.from(prompt_presets)
			.where(eq(prompt_presets.id, body.presetId));
		const presetRow = preset[0];
		if (!presetRow) {
			set.status = 404;
			return { error: 'Preset not found' };
		}
		const snapshot = {
			name: presetRow.name,
			platform: presetRow.platform,
			aspect_ratio: presetRow.aspect_ratio,
			language: presetRow.language,
			visual_tone: presetRow.visual_tone
		};
		const outcome = await generatePrompt({
			postId: postRow.id,
			presetId: presetRow.id,
			article: postRow.article_body,
			title: postRow.title,
			presetSnapshot: snapshot
		});
		set.status = outcome.status === 'success' ? 200 : 422;
		return outcome;
	},
	{
		body: t.Object({
			presetId: t.Number()
		})
	}
);
