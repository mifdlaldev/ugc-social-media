import type { PageServerLoad } from './$types';
import { getPublishedPostBySlug } from '$lib/server/posts';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostBySlug(params.slug);
	return { post };
};
