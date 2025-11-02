<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Breadcrumb from './Breadcrumb.svelte';

	export type BreadcrumbItem = {
		text: string;
		href?: string;
		isCurrent?: boolean;
	};

	let {
		children,
		breadcrumbItems,
		className
	}: { children: any; breadcrumbItems: BreadcrumbItem[]; className?: string } = $props();
</script>

<div>
	<div
		class={'sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-gray-100 bg-gray-100 p-4'}
	>
		<Sidebar.Trigger />
		<Breadcrumb {breadcrumbItems} />
	</div>
	<div class={`h-[calc(100%-3.5rem)] w-full p-4  ${className ?? ''} `}>
		{@render children()}
	</div>
</div>
