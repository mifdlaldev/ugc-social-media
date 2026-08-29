import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing (PBKDF2-SHA256)', () => {
	it('hashes and verifies a correct password', async () => {
		const stored = await hashPassword('s3cret-owner-password');
		expect(stored.startsWith('pbkdf2-sha256.')).toBe(true);
		await expect(verifyPassword('s3cret-owner-password', stored)).resolves.toBe(true);
	});

	it('rejects an incorrect password', async () => {
		const stored = await hashPassword('correct-horse');
		await expect(verifyPassword('wrong-password', stored)).resolves.toBe(false);
	});

	it('produces a different hash per call (random salt)', async () => {
		const a = await hashPassword('same-password');
		const b = await hashPassword('same-password');
		expect(a).not.toBe(b);
	});

	it('rejects malformed stored hashes', async () => {
		await expect(verifyPassword('x', 'not-a-hash')).resolves.toBe(false);
		await expect(verifyPassword('x', 'pbkdf2-sha256.0.salt.hash')).resolves.toBe(false);
		await expect(verifyPassword('x', 'pbkdf2-sha256.abc.salt.hash')).resolves.toBe(false);
	});

	it('does not use "$" in the stored format (dotenv-safe)', async () => {
		const stored = await hashPassword('dotenv-safety');
		expect(stored).not.toContain('$');
	});
});
