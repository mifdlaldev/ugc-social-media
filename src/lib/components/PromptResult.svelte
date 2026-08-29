<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import BlockCard from '$lib/components/BlockCard.svelte';
	import type { PromptGenerationResult } from '$lib/server/promptSchema';

	let {
		result,
		onretry
	}: {
		result: PromptGenerationResult;
		onretry?: () => void;
	} = $props();

	let copiedBlockId = $state<string | null>(null);

	async function copyText(text: string, blockId: string) {
		await navigator.clipboard.writeText(text);
		copiedBlockId = blockId;
		setTimeout(() => (copiedBlockId = null), 2000);
	}

	async function copyAll() {
		const blocks = Object.values(result.blocks);
		const parts = [
			`JUDUL: ${result.sourceSummary}`,
			...blocks.flatMap((b) => {
				const arr = Array.isArray(b) ? b : [b];
				return arr.map((block) => `[${block.label}]\n${block.content}`);
			})
		];
		await navigator.clipboard.writeText(parts.join('\n\n'));
		copiedBlockId = 'ALL';
		setTimeout(() => (copiedBlockId = null), 2000);
	}

	function copyBtn(id: string) {
		return copiedBlockId === id ? 'Copied!' : 'Copy';
	}
</script>

<div class="flex flex-col gap-6">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg">Prompt Siap Pakai</Card.Title>
			<Card.Description>
				Salin blok-blok ini ke generator gambar eksternal (ChatGPT/GPT Image, Nano Banana, dll).
			</Card.Description>
		</Card.Header>
		<Card.Footer class="justify-end">
			<Button onclick={copyAll} variant="default">
				{copiedBlockId === 'ALL' ? 'Tersalin!' : 'Salin Semua Blok'}
			</Button>
		</Card.Footer>
	</Card.Root>

	<div class="flex flex-col gap-4">
		{#each Object.values(result.blocks) as group (Array.isArray(group) ? group
					.map((b) => b.id)
					.join(',') : group.id)}
			{#if Array.isArray(group)}
				{#each group as block (block.id)}
					<BlockCard
						{block}
						prefix="Tool note"
						copied={copiedBlockId === block.id}
						oncopy={() => copyText(block.content, block.id)}
						copyLabel={copyBtn(block.id)}
					/>
				{/each}
			{:else}
				<BlockCard
					block={group}
					copied={copiedBlockId === group.id}
					oncopy={() => copyText(group.content, group.id)}
					copyLabel={copyBtn(group.id)}
				/>
			{/if}
		{/each}
	</div>

	{#if result.fidelityNotes.length > 0}
		<Alert>
			<AlertTitle>Catatan Fidelitas</AlertTitle>
			<AlertDescription>
				<ul class="list-disc pl-5">
					{#each result.fidelityNotes as note (note)}
						<li>{note}</li>
					{/each}
				</ul>
			</AlertDescription>
		</Alert>
	{/if}

	{#if onretry}
		<div class="flex justify-end">
			<Button variant="outline" onclick={onretry}>Retry</Button>
		</div>
	{/if}
</div>
