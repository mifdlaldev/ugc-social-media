import type { PageServerLoad } from './$types';
import { listPublishedPosts } from '$lib/server/posts';

export const load: PageServerLoad = async () => {
	const posts = await listPublishedPosts();
	return { posts };
};
