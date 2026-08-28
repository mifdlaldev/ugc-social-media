<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	let { data }: PageProps = $props();
	const presets = $derived(data.presets);

	let showForm = $state(false);
	let editingId = $state<number | null>(null);
	let name = $state('');
	let platform = $state('Instagram');
	let aspectRatio = $state('1:1');
	let visualTone = $state('');
	let error = $state('');
	let loading = $state(false);

	function startCreate() {
		editingId = null;
		name = '';
		platform = 'Instagram';
		aspectRatio = '1:1';
		visualTone = '';
		showForm = true;
	}

	function startEdit(p: (typeof presets)[number]) {
		editingId = p.id;
		name = p.name;
		platform = p.platform;
		aspectRatio = p.aspect_ratio;
		visualTone = p.visual_tone ?? '';
		showForm = true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;
		try {
			const payload = {
				name,
				platform,
				aspect_ratio: aspectRatio,
				visual_tone: visualTone || undefined
			};
			const res = await fetch(editingId ? `/api/presets/${editingId}` : '/api/presets', {
				method: editingId ? 'PUT' : 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = (await res.json()) as { error?: string };
			if (!res.ok) {
				error = result.error ?? 'Gagal menyimpan preset';
			} else {
				showForm = false;
				window.location.reload();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	async function deletePreset(id: number) {
		if (!confirm('Hapus preset ini?')) return;
		const res = await fetch(`/api/presets/${id}`, { method: 'DELETE' });
		if (res.ok) {
			window.location.reload();
		} else {
			alert('Gagal menghapus preset');
		}
	}
</script>

<svelte:head>
	<title>Prompt Presets — Owner</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Prompt Presets</h1>
			<p class="mt-1 text-muted-foreground">
				Preset menentukan platform target, aspect ratio, dan tone visual saat prompt dibuat.
			</p>
		</div>
		<Button onclick={startCreate}>+ Preset Baru</Button>
	</header>

	{#if showForm}
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>{editingId ? 'Edit Preset' : 'Preset Baru'}</Card.Title>
			</Card.Header>
			<Card.Content>
				<form onsubmit={handleSubmit} class="flex flex-col gap-4">
					<Field.Field>
						<Field.FieldLabel for="name">Nama</Field.FieldLabel>
						<Input id="name" bind:value={name} required maxlength={100} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="platform">Platform</Field.FieldLabel>
						<Input id="platform" bind:value={platform} required maxlength={60} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="aspect">Aspect Ratio</Field.FieldLabel>
						<Input
							id="aspect"
							bind:value={aspectRatio}
							required
							maxlength={10}
							placeholder="1:1, 9:16, 4:5"
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="tone">Visual Tone</Field.FieldLabel>
						<Textarea id="tone" bind:value={visualTone} maxlength={500} rows={3} />
					</Field.Field>
					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}
					<div class="flex justify-end gap-2">
						<Button type="button" variant="outline" onclick={() => (showForm = false)}>
							Batal
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<div class="flex flex-col gap-4">
		{#each presets as preset (preset.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{preset.platform}</Badge>
						<Badge variant="outline">{preset.aspect_ratio}</Badge>
						{#if preset.is_active}
							<Badge variant="default">Active</Badge>
						{:else}
							<Badge variant="outline">Inactive</Badge>
						{/if}
					</div>
					<Card.Title>{preset.name}</Card.Title>
					{#if preset.visual_tone}
						<Card.Description>{preset.visual_tone}</Card.Description>
					{/if}
				</Card.Header>
				<Card.Footer class="flex justify-end gap-2">
					<Button variant="outline" size="sm" onclick={() => startEdit(preset)}>Edit</Button>
					<Button variant="destructive" size="sm" onclick={() => deletePreset(preset.id)}>
						Hapus
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>

	<div class="mt-8">
		<a href="/owner">
			<Button variant="outline">← Kembali ke Workspace</Button>
		</a>
	</div>
</div>
