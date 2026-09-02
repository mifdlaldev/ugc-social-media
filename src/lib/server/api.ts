import { Elysia, t } from 'elysia';
import { loginOwner, requireOwner } from './auth';
import { clearSessionCookie } from './session';
import { postsApi } from './postsApi';

export const api = new Elysia({ aot: false })
	.get('/api/health', () => ({
		status: 'ok',
		service: 'ugc-social-media-api',
		timestamp: new Date().toISOString()
	}))
	.post(
		'/api/auth/login',
		async ({ body, set }) => {
			try {
				const { cookie, expiresAt } = await loginOwner(body.password);
				set.headers['Set-Cookie'] = cookie;
				set.status = 200;
				return { ok: true, expiresAt };
			} catch (error) {
				if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
					set.status = 401;
					return { ok: false, error: 'Invalid credentials' };
				}
				throw error;
			}
		},
		{
			body: t.Object({
				password: t.String({ minLength: 1, maxLength: 256 })
			})
		}
	)
	.post('/api/auth/logout', ({ set }) => {
		set.headers['Set-Cookie'] = clearSessionCookie();
		set.status = 200;
		return { ok: true };
	})
	.get('/api/auth/session', async ({ request, set }) => {
		try {
			const session = await requireOwner(request);
			set.status = 200;
			return { ok: true, authenticated: true, session };
		} catch (error) {
			if (error instanceof Error && error.message === 'UNAUTHORIZED') {
				set.status = 200;
				return { ok: true, authenticated: false, session: null };
			}
			throw error;
		}
	})
	.use(postsApi)
	.onError(({ code, error, set }) => {
		const message = error instanceof Error ? error.message : 'Internal error';
		if (code === 'NOT_FOUND') {
			set.status = 404;
			return { error: 'Not found' };
		}
		if (code === 'VALIDATION') {
			set.status = 400;
			return { error: 'Validation error' };
		}
		if (message === 'UNAUTHORIZED') {
			set.status = 401;
			return { error: 'Unauthorized' };
		}
		console.error('API error:', message);
		set.status = 500;
		return { error: 'Internal server error' };
	});
