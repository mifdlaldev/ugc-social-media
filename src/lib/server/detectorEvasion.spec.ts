import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN_TERMS = [
	'ai detector',
	'ai-detector',
	'detector',
	'ai detection',
	'undetectable',
	'bypass detection',
	'evade detection',
	'gptzero',
	'originality.ai',
	'turnitin',
	'humanize',
	'perplexity score',
	'burstiness'
];

function productionSources(dir: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			found.push(...productionSources(full));
			continue;
		}
		if (entry.endsWith('.spec.ts') || entry.endsWith('.test.ts')) continue;
		if (entry.endsWith('.ts') || entry.endsWith('.svelte')) found.push(full);
	}
	return found;
}

describe('no detector-evasion instruction', () => {
	it('appears in no production source file', () => {
		const offenders: string[] = [];
		for (const file of productionSources('src')) {
			const lowered = readFileSync(file, 'utf8').toLowerCase();
			for (const term of FORBIDDEN_TERMS) {
				if (lowered.includes(term)) offenders.push(`${file}: ${term}`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it('scans a meaningful number of files', () => {
		expect(productionSources('src').length).toBeGreaterThan(20);
	});
});
