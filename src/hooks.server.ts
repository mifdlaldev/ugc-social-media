import type { Handle } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import { setPlatformEnv } from '$lib/server/config';

const handle: Handle = async ({ event, resolve }) => {
	setPlatformEnv(event.platform?.env);
	if (event.url.pathname.startsWith('/api')) {
		return api.handle(event.request);
	}
	return resolve(event);
};

export { handle };
