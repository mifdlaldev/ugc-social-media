import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getOwnerPostById } from '$lib/server/posts';
import { db } from '$lib/server/db';
import { post_research_sources } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { compileResearch } from '$lib/server/researchService';

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
	return { post, sources };
};

export const actions: Actions = {
	research: async ({ params, request }) => {
		const postId = Number(params.id);
		const post = await getOwnerPostById(postId);
		if (!post) {
			return { success: false, error: 'Post not found' };
		}

		try {
			const research = await compileResearch(post.topic);

			await db.delete(post_research_sources).where(eq(post_research_sources.post_id, postId));

			for (const source of research.sources) {
				await db.insert(post_research_sources).values({
					post_id: postId,
					source_url: source.url,
					source_title: source.title,
					source_snippet: source.snippet,
					source_engine: 'you.com',
					relevance_score: null
				});
			}

			return { success: true, count: research.sources.length };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			return { success: false, error: message };
		}
	}
};
