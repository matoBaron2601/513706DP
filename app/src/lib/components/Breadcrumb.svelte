<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import type { BreadcrumbItem } from './PageWrapper.svelte';

	// Props
	export let breadcrumbItems: BreadcrumbItem[] = [];
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			{#if breadcrumbItems.length === 0}
				<Breadcrumb.Page>Home</Breadcrumb.Page>
			{:else}
				<Breadcrumb.Link
					class="rounded-2xl p-0.5 px-1.5 hover:bg-[#f7e7d0] hover:shadow-2xl"
					href="/">Home</Breadcrumb.Link
				>
				<Breadcrumb.Separator class="text-[#694018]" />
			{/if}
		</Breadcrumb.Item>

		{#each breadcrumbItems as item, i (item.text)}
			<Breadcrumb.Item>
				{#if item.isCurrent || !item.href}
					<Breadcrumb.Page aria-current="page">{item.text}</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link class="rounded-2xl p-1 px-2 hover:bg-[#f7e7d0]" href={item.href}
						>{item.text}</Breadcrumb.Link
					>
				{/if}

				{#if i < breadcrumbItems.length - 1}
					<Breadcrumb.Separator class="text-[#694018]" />
				{/if}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
