import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOwnerPostById } from '$lib/server/posts';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
	}
	const post = await getOwnerPostById(params.id);
	if (!post) {
		throw redirect(302, '/owner');
	}
	return { post };
};
