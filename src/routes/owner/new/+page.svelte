<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data }: PageProps = $props();
	const categories = $derived(data.categories);

	let title = $state('');
	let excerpt = $state('');
	let articleBody = $state('');
	let status = $state<'draft' | 'published'>('draft');
	let selectedCategories = $state<number[]>([]);
	let error = $state('');
	let loading = $state(false);

	function toggleCategory(id: number) {
		if (selectedCategories.includes(id)) {
			selectedCategories = selectedCategories.filter((c) => c !== id);
		} else {
			selectedCategories = [...selectedCategories, id];
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/posts', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title,
					article_body: articleBody,
					excerpt: excerpt || undefined,
					status
				})
			});
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (!res.ok) {
				error = data.error ?? 'Gagal menyimpan artikel';
			} else {
				window.location.href = '/owner';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Artikel Baru</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold tracking-tight">Artikel Baru</h1>

	<Card.Root>
		<Card.Content>
			<form onsubmit={handleSubmit} class="flex flex-col gap-5">
				<Field.Field>
					<Field.FieldLabel for="title">Judul</Field.FieldLabel>
					<Input id="title" bind:value={title} required maxlength={200} />
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="excerpt">Ringkasan (opsional)</Field.FieldLabel>
					<Textarea id="excerpt" bind:value={excerpt} maxlength={500} rows={2} />
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="article_body">Isi Artikel</Field.FieldLabel>
					<Textarea
						id="article_body"
						bind:value={articleBody}
						required
						maxlength={10000}
						rows={12}
					/>
					<Field.FieldDescription>
						Maksimal 10.000 karakter. Ini yang dikonversi menjadi prompt infografis.
					</Field.FieldDescription>
				</Field.Field>

				<Field.Field>
					<Field.FieldLegend>Kategori</Field.FieldLegend>
					<Field.FieldSet>
						<div class="flex flex-wrap gap-2">
							{#each categories as cat (cat.id)}
								<button
									type="button"
									onclick={() => toggleCategory(cat.id)}
									class="cursor-pointer rounded-full border p-0"
									aria-pressed={selectedCategories.includes(cat.id)}
								>
									<Badge variant={selectedCategories.includes(cat.id) ? 'default' : 'secondary'}>
										{cat.name}
									</Badge>
								</button>
							{/each}
						</div>
					</Field.FieldSet>
				</Field.Field>

				<Field.Field>
					<Field.FieldLegend>Status</Field.FieldLegend>
					<Field.FieldSet>
						<label class="flex items-center gap-2">
							<input type="radio" name="status" value="draft" bind:group={status} />
							Draft
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" name="status" value="published" bind:group={status} />
							Published
						</label>
					</Field.FieldSet>
				</Field.Field>

				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}

				<div class="flex justify-end gap-2">
					<a href="/owner">
						<Button type="button" variant="outline">Batal</Button>
					</a>
					<Button type="submit" disabled={loading}>
						{loading ? 'Menyimpan...' : 'Simpan Artikel'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
