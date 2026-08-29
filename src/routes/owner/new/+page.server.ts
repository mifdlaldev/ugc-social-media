import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
	}
	return {};
};