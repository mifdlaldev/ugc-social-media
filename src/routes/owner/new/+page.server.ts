import type { PageServerLoad } from './$types';
import { getSessionFromRequest } from '$lib/server/auth';
import { listCategories } from '$lib/server/posts';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
	const session = await getSessionFromRequest(request);
	if (!session) {
		throw redirect(303, '/login');
	}
	const categories = await listCategories();
	return { categories };
};
