<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Params } from '$lib/types';
	import { page } from '$app/state';

	let { unknownParamText }: { unknownParamText?: string } = $props();

	let params: Params[] = page.url.pathname.split('/').filter(Boolean) as Params[];

	const pageMap: Record<Params, { name: string; href: string }> = {
		[Params.dataset]: { name: 'Dataset', href: '' },
		[Params.custom]: { name: 'Custom', href: '/dataset/custom' },
		[Params.default]: { name: 'Default', href: '/dataset/default' },
		[Params.quiz]: { name: 'Quiz', href: '' },
		[Params.create]: { name: 'Create', href: '/quiz/create' },
		[Params.history]: { name: 'History', href: '/quiz/history' },
		[Params.attended]: { name: 'Attended', href: '/quiz/attended' },
		[Params.created]: { name: 'Created', href: '/quiz/created' },
		[Params.list]: { name: 'List', href: '' }
	};

</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			{#if params.length == 0}
				<Breadcrumb.Page>{'Home'}</Breadcrumb.Page>
			{:else}
				<Breadcrumb.Link href={'/'}>{'Home'}</Breadcrumb.Link>
				<Breadcrumb.Separator />
			{/if}
		</Breadcrumb.Item>
		{#each params as page, i (page)}
			<Breadcrumb.Item>
				{#if pageMap[page]}
					{#if pageMap[page].href !== '' && i < params.length - 1}
						<Breadcrumb.Link href={pageMap[page].href}>{pageMap[page].name}</Breadcrumb.Link>
					{:else}
						<Breadcrumb.Page>{pageMap[page].name}</Breadcrumb.Page>
					{/if}
				{:else}
					<Breadcrumb.Page>{unknownParamText}</Breadcrumb.Page>
				{/if}
				{#if i < params.length - 1}
					<Breadcrumb.Separator />
				{/if}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
