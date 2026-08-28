import { Elysia } from 'elysia';

export const api = new Elysia()
	.get('/api/health', () => ({
		status: 'ok',
		service: 'ugc-social-media-api',
		timestamp: new Date().toISOString()
	}))
	.onError(({ code, error, set }) => {
		const message = error instanceof Error ? error.message : 'Internal error';
		if (code === 'NOT_FOUND') {
			set.status = 404;
			return { error: 'Not found' };
		}
		console.error('API error:', message);
		set.status = 500;
		return { error: 'Internal server error' };
	});
