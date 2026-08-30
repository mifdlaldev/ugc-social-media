import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	DEFAULT_VISUAL_COMMAND,
	VISUAL_COMMANDS,
	VISUAL_COMMAND_VALUES,
	findVisualCommand,
	isVisualCommand
} from './visualCommands';

const REFERENCE = readFileSync(resolve(process.cwd(), 'docs/prompt-command-reference.md'), 'utf-8');

/** Rows in the reference catalog look like: `| 4 | \`/infographic\` | Tata letak infografis |` */
function referenceDescriptions(command: string): string[] {
	const rows = REFERENCE.split('\n').filter(
		(line) => line.startsWith(`| `) && line.includes(`\`${command}\``)
	);
	return rows.map((row) => {
		const cells = row.split('|').map((cell) => cell.trim());
		return cells[3] ?? '';
	});
}

describe('visual command catalog', () => {
	it('contains exactly the 18 approved commands', () => {
		expect(VISUAL_COMMANDS).toHaveLength(18);
	});

	it('has no duplicate values', () => {
		expect(new Set(VISUAL_COMMAND_VALUES).size).toBe(VISUAL_COMMAND_VALUES.length);
	});

	it('matches the approved value list from the OpenSpec change', () => {
		expect(VISUAL_COMMAND_VALUES).toEqual([
			'/infographic',
			'/scientificdiagram',
			'/diagram',
			'/schematic',
			'/flowchart',
			'/process',
			'/comparison',
			'/timeline',
			'/conceptmap',
			'/anatomy',
			'/blueprint',
			'/isometric',
			'/explodedview',
			'/cutaway',
			'/crosssection',
			'/layers',
			'/scale',
			'/handwrittennotes'
		]);
	});

	it('uses only slash-prefixed lowercase command values', () => {
		for (const command of VISUAL_COMMANDS) {
			expect(command.value).toMatch(/^\/[a-z0-9]+$/);
		}
	});

	it('carries a non-empty label and description for every command', () => {
		for (const command of VISUAL_COMMANDS) {
			expect(command.label.trim().length).toBeGreaterThan(0);
			expect(command.description.trim().length).toBeGreaterThan(0);
		}
	});

	it('reproduces each description verbatim from docs/prompt-command-reference.md', () => {
		for (const command of VISUAL_COMMANDS) {
			const candidates = referenceDescriptions(command.value);
			expect(
				candidates.length,
				`${command.value} is absent from the reference catalog`
			).toBeGreaterThan(0);
			expect(
				candidates,
				`${command.value} description does not match the reference catalog`
			).toContain(command.description);
		}
	});

	it('exposes a default that exists in the catalog', () => {
		expect(isVisualCommand(DEFAULT_VISUAL_COMMAND)).toBe(true);
	});

	it('rejects a command outside the curated set', () => {
		expect(isVisualCommand('/cyberpunk')).toBe(false);
		expect(findVisualCommand('/cyberpunk')).toBeUndefined();
	});

	it('excludes commands that exist in the PDFs but were not approved', () => {
		for (const notApproved of ['/cyberpunk', '/anime', '/logo', '/pixelart', '/oilpainting']) {
			expect(isVisualCommand(notApproved)).toBe(false);
		}
	});
});
