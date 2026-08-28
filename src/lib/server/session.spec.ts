import { describe, expect, it } from 'vitest';
import { clearSessionCookie, createSession, readSessionCookie, verifySession } from './session';

const SECRET = 'test-secret-32-bytes-abcdefghijkl';

describe('session cookie', () => {
	it('creates a verifiable session token', async () => {
		const { token } = await createSession(SECRET);
		const session = await verifySession(SECRET, token);
		expect(session?.sub).toBe('owner');
		expect(session?.exp).toBeGreaterThan(Date.now() / 1000);
	});

	it('rejects a tampered token', async () => {
		const { token } = await createSession(SECRET);
		const [body, sig] = token.split('.');
		const tampered = `${body}x.${sig}`;
		await expect(verifySession(SECRET, tampered)).resolves.toBeNull();
	});

	it('rejects a token signed with a different secret', async () => {
		const { token } = await createSession('different-secret');
		await expect(verifySession(SECRET, token)).resolves.toBeNull();
	});

	it('rejects an expired session', async () => {
		const { token } = await createSession(SECRET);
		const [body, sig] = token.split('.');
		const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
		payload.exp = Math.floor(Date.now() / 1000) - 10;
		const newBody = btoa(JSON.stringify(payload))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
		await expect(verifySession(SECRET, `${newBody}.${sig}`)).resolves.toBeNull();
	});

	it('reads the session cookie from a Cookie header', () => {
		const { token } = { token: 'abc.def' };
		const header = `other=1; ugc_session=${token}; pref=dark`;
		expect(readSessionCookie(header)).toBe(token);
		expect(readSessionCookie(null)).toBeNull();
		expect(readSessionCookie('other=1')).toBeNull();
	});

	it('produces a clearing cookie for logout', () => {
		const cookie = clearSessionCookie();
		expect(cookie).toContain('Max-Age=0');
		expect(cookie).toContain('Path=/');
	});
});
