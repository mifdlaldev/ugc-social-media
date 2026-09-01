import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const libAlias = { find: '$lib', replacement: path.resolve('src/lib') };

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				test: {
					name: 'dom',
					environment: 'jsdom',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./testing-library.setup.ts'],
					server: { deps: { inline: ['svelte'] } }
				},
				resolve: { alias: [libAlias], conditions: ['browser'] },
				plugins: [tailwindcss(), svelte()]
			}
		]
	}
});
