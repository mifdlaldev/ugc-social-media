<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as Field from '$lib/components/ui/field';
	import {
		VISUAL_COMMANDS,
		VISUAL_COMMAND_CATEGORY_LABELS,
		findVisualCommand,
		type VisualCommandCategory
	} from '$lib/catalog/visualCommands';

	let { value = $bindable() }: { value: string } = $props();

	const categories = Object.keys(VISUAL_COMMAND_CATEGORY_LABELS) as VisualCommandCategory[];

	let selected = $derived(findVisualCommand(value));

	function commandsIn(category: VisualCommandCategory) {
		return VISUAL_COMMANDS.filter((command) => command.category === category);
	}
</script>

<Field.Field>
	<Field.FieldLabel>Bentuk Visual</Field.FieldLabel>
	<Select.Root type="single" bind:value>
		<Select.Trigger>
			{#if selected}
				<span class="font-mono">{selected.value}</span>
				<span class="text-text-muted">— {selected.label}</span>
			{:else}
				Pilih bentuk visual
			{/if}
		</Select.Trigger>
		<Select.Content>
			{#each categories as category (category)}
				<Select.Group>
					<Select.GroupHeading>
						{VISUAL_COMMAND_CATEGORY_LABELS[category]}
					</Select.GroupHeading>
					{#each commandsIn(category) as command (command.value)}
						<Select.Item value={command.value} label={`${command.value} — ${command.label}`} />
					{/each}
				</Select.Group>
			{/each}
		</Select.Content>
	</Select.Root>
	<Field.FieldDescription>
		{#if selected}
			{selected.description}
		{:else}
			Menentukan bentuk penyajian visual, bukan isi faktual.
		{/if}
	</Field.FieldDescription>
</Field.Field>
