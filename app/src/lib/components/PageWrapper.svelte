<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Breadcrumb from './Breadcrumb.svelte';
	import Button from './ui/button/button.svelte';
	import { ArrowBigLeft } from '@lucide/svelte';

	export type BreadcrumbItem = {
		text: string;
		href?: string;
		isCurrent?: boolean;
		goBackUrl?: string;
	};

	let {
		breadcrumbItems,
		className,
		children,
		extraButton
	}: {
		breadcrumbItems: BreadcrumbItem[];
		className?: string;
		children?: any;
		extraButton?: any;
	} = $props();
</script>

<div class="lg:max-w-[80%] xl:max-w-[70%]">
	<div class="sticky top-0 flex h-14 items-center gap-2 border-b border-gray-100 bg-gray-100 p-4">
		<Sidebar.Trigger />
		<Breadcrumb {breadcrumbItems} />
	</div>

	<div class="ml-4 flex items-center gap-4">
		<Button class="cursor-pointer"><ArrowBigLeft /></Button>
		{#if extraButton}
			{@render extraButton()}
		{/if}
	</div>

	<div class={`h-[calc(100%-3.5rem)] w-full p-4 ${className ?? ''}`}>
		{@render children?.()}
	</div>
</div>
