import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getOwnerPostById } from '$lib/server/posts';
import { db } from '$lib/server/db';
import {
	generation_attempts,
	post_research_sources,
	prompt_slides,
	provider_variants
} from '$lib/server/schema';
import { eq, inArray } from 'drizzle-orm';
import { generateSlides } from '$lib/server/promptGenerator';
import { config } from '$lib/server/config';
import { createHash } from 'node:crypto';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
	}
	const post = await getOwnerPostById(Number(params.id));
	if (!post) {
		throw redirect(302, '/owner');
	}

	const sources = await db
		.select()
		.from(post_research_sources)
		.where(eq(post_research_sources.post_id, post.id));

	const slides = await db.select().from(prompt_slides).where(eq(prompt_slides.post_id, post.id));

	const slideIds = slides.map((s) => s.id);
	const variants =
		slideIds.length > 0
			? await db
					.select()
					.from(provider_variants)
					.where(inArray(provider_variants.slide_id, slideIds))
			: [];

	return { post, sources, slides, variants };
};

export const actions: Actions = {
	generate: async ({ params }) => {
		const postId = Number(params.id);
		const post = await getOwnerPostById(postId);
		if (!post) {
			return { success: false, error: 'Post not found' };
		}

		const sources = await db
			.select()
			.from(post_research_sources)
			.where(eq(post_research_sources.post_id, postId));

		if (sources.length === 0) {
			return { success: false, error: 'Belum ada riset. Jalankan riset dulu.' };
		}

		const researchBrief = sources
			.map(
				(s, i) =>
					`[${i + 1}] ${s.source_title ?? ''}\n${s.source_snippet ?? ''}\nURL: ${s.source_url}`
			)
			.join('\n\n');

		try {
			const result = await generateSlides(
				post.topic,
				researchBrief,
				post.platform,
				post.tone,
				post.slide_count
			);

			const oldSlides = await db
				.select({ id: prompt_slides.id })
				.from(prompt_slides)
				.where(eq(prompt_slides.post_id, postId));

			if (oldSlides.length > 0) {
				const oldIds = oldSlides.map((s) => s.id);
				await db.delete(provider_variants).where(inArray(provider_variants.slide_id, oldIds));
			}
			await db.delete(prompt_slides).where(eq(prompt_slides.post_id, postId));

			for (const slide of result.slides) {
				const [inserted] = await db
					.insert(prompt_slides)
					.values({
						post_id: postId,
						slide_index: slide.slide_index,
						slide_type: slide.slide_type,
						slide_title: slide.slide_title,
						research_context: slide.research_context
					})
					.returning();

				if (!inserted) continue;

				for (const variant of slide.variants) {
					await db.insert(provider_variants).values({
						slide_id: inserted.id,
						provider: variant.provider,
						prompt_text: variant.prompt_text,
						visual_notes: variant.visual_notes,
						on_image_text: variant.on_image_text,
						aspect_ratio: variant.aspect_ratio
					});
				}
			}

			const inputHash = createHash('sha256')
				.update(post.topic + researchBrief)
				.digest('hex')
				.slice(0, 16);

			await db.insert(generation_attempts).values({
				post_id: postId,
				input_hash: inputHash,
				model_id: config.openRouterModel,
				raw_output: JSON.stringify(result.synthesis),
				parsed_result: JSON.stringify(result.slides),
				status: 'success'
			});

			return { success: true, slideCount: result.slides.length };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			return { success: false, error: message };
		}
	}
};
