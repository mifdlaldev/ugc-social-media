import type { Handle } from '@sveltejs/kit';
import { api } from '$lib/server/api';

const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		return api.handle(event.request);
	}
	return resolve(event);
};

export { handle };
