import type { PageServerLoad } from './$types';
import { getSessionFromRequest } from '$lib/server/auth';
import { getOwnerPostById, listCategories } from '$lib/server/posts';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request, params }) => {
	const session = await getSessionFromRequest(request);
	if (!session) {
		throw redirect(303, '/login');
	}
	const post = await getOwnerPostById(Number(params.id));
	if (!post) {
		throw error(404, 'Post tidak ditemukan');
	}
	const categories = await listCategories();
	return { post, categories };
};
