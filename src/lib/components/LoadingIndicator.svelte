<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { label, hint }: { label: string; hint?: string } = $props();
</script>

<div class="mt-3 flex items-start gap-3" role="status" aria-live="polite" aria-busy="true">
	<div class="relative flex h-5 w-5 shrink-0 items-center justify-center">
		<div
			class="pointer-events-none absolute h-full w-full animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none"
		></div>
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-sm font-medium text-foreground">{label}</span>
			{#if hint}
				<Badge variant="outline" class="text-xs">{hint}</Badge>
			{/if}
		</div>

		<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary">
			<div
				class="h-full w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-accent motion-reduce:animate-none"
			></div>
		</div>
	</div>
</div>
