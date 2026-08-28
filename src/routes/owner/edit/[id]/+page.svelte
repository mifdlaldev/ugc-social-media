<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data }: PageProps = $props();
	const post = $derived(data.post);

	let title = $state(post.title);
	let excerpt = $state(post.excerpt ?? '');
	let articleBody = $state(post.article_body);
	let status = $state<'draft' | 'published'>(post.status);
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;
		try {
			const res = await fetch(`/api/posts/${post.id}`, {
				method: 'PUT',
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
	<title>Edit Artikel</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold tracking-tight">Edit Artikel</h1>

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
					<Field.FieldDescription>Maksimal 10.000 karakter.</Field.FieldDescription>
				</Field.Field>

				<Field.Field>
					<Field.FieldLegend>Kategori saat ini</Field.FieldLegend>
					<div class="flex flex-wrap gap-2">
						{#each post.categories as cat (cat.id)}
							<Badge variant="secondary">{cat.name}</Badge>
						{/each}
					</div>
					<Field.FieldDescription>
						Kategori dapat diubah di versi berikutnya.
					</Field.FieldDescription>
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
						{loading ? 'Menyimpan...' : 'Simpan Perubahan'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
