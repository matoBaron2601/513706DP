<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Breadcrumb from './Breadcrumb.svelte';
	import Button from './ui/button/button.svelte';
	import { ArrowBigLeft } from '@lucide/svelte';
	import { page } from '$app/state';

	export type BreadcrumbItem = {
		text: string;
		href?: string;
		isCurrent?: boolean;
	};

	let {
		breadcrumbItems,
		className,
		children,
		goBackUrl,
		extraButton,
		classNameWrapper
	}: {
		breadcrumbItems: BreadcrumbItem[];
		className?: string;
		children?: any;
		goBackUrl?: string;
		extraButton?: any;
		classNameWrapper?: string;
	} = $props();
</script>

<div class={`lg:max-w-[80%] xl:max-w-[70%] ${classNameWrapper ?? ''}`}>
	<div class="sticky top-0 flex h-14 items-center gap-2 border-b border-gray-100 bg-gray-100 p-4">
		<Sidebar.Trigger />
		<Breadcrumb {breadcrumbItems} />
	</div>

	<div class="ml-4 flex items-center gap-4">
		{#if goBackUrl}
			<Button class="cursor-pointer" onclick={() => goto(goBackUrl)}><ArrowBigLeft /></Button>
		{/if}
		{#if extraButton}
			{@render extraButton()}
		{/if}
	</div>

	<div class={`h-[calc(100%-3.5rem)] w-full p-4 ${className ?? ''}`}>
		{@render children?.()}
	</div>
</div>
