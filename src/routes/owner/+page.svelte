<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';

	let { data }: PageProps = $props();
	const posts = $derived(data.posts);

	async function deletePost(id: number) {
		if (!confirm('Hapus artikel ini?')) return;
		const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
		if (res.ok) {
			window.location.reload();
		} else {
			alert('Gagal menghapus artikel');
		}
	}
</script>

<svelte:head>
	<title>Workspace Owner</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Workspace Owner</h1>
			<p class="mt-1 text-muted-foreground">Kelola artikel edukasi Anda.</p>
		</div>
		<div class="flex gap-2">
			<a href="/owner/new">
				<Button>+ Artikel Baru</Button>
			</a>
			<a href="/owner/presets">
				<Button variant="outline">Presets</Button>
			</a>
			<a href="/">
				<Button variant="outline">Lihat Beranda</Button>
			</a>
		</div>
	</header>

	<div class="flex flex-col gap-4">
		{#each posts as post (post.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex flex-wrap items-center gap-2">
						{#each post.categories as cat (cat.id)}
							<Badge variant="secondary">{cat.name}</Badge>
						{/each}
						{#if post.status === 'published'}
							<Badge variant="default">Published</Badge>
						{:else}
							<Badge variant="outline">Draft</Badge>
						{/if}
					</div>
					<Card.Title>{post.title}</Card.Title>
					{#if post.excerpt}
						<Card.Description>{post.excerpt}</Card.Description>
					{/if}
				</Card.Header>
				<Card.Footer class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">
						Diperbarui: {new Date(post.updated_at).toLocaleDateString('id-ID')}
					</span>
					<div class="flex gap-2">
						<a href={`/owner/edit/${post.id}`}>
							<Button variant="outline" size="sm">Edit</Button>
						</a>
						<Button variant="destructive" size="sm" onclick={() => deletePost(post.id)}>
							Hapus
						</Button>
					</div>
				</Card.Footer>
			</Card.Root>
		{:else}
			<p class="text-muted-foreground">Belum ada artikel. Klik "+ Artikel Baru" untuk mulai.</p>
		{/each}
	</div>
</div>
