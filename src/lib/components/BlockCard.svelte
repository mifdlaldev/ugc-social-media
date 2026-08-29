<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let {
		block,
		prefix,
		copied,
		oncopy,
		copyLabel
	}: {
		block: { label: string; content: string };
		prefix?: string;
		copied: boolean;
		oncopy: () => void;
		copyLabel: string;
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				{#if prefix}
					<Badge variant="outline">{prefix}</Badge>
				{/if}
				<Card.Title class="text-sm">{block.label}</Card.Title>
			</div>
			<Button size="sm" variant="outline" onclick={oncopy}
				>{copied ? 'Tersalin!' : copyLabel}</Button
			>
		</div>
	</Card.Header>
	<Card.Content>
		<p class="text-sm whitespace-pre-wrap text-foreground">{block.content}</p>
	</Card.Content>
</Card.Root>
