import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listAllPosts } from '$lib/server/posts';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
	}
	const posts = await listAllPosts();
	if (posts.length === 0) {
		return { posts: [], nextPath: '/owner' };
	}
	return { posts, nextPath: '/owner' };
};

export const _error = error;