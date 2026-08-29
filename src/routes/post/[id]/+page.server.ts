import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPublishedPostById } from '$lib/server/posts';
import { db } from '$lib/server/db';
import { post_research_sources } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostById(Number(params.id));
	if (!post) {
		throw error(404, 'Post tidak ditemukan');
	}
	const sources = await db
		.select()
		.from(post_research_sources)
		.where(eq(post_research_sources.post_id, post.id));
	return { post, sources };
};
