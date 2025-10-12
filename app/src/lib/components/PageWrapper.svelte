<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Breadcrumb from './Breadcrumb.svelte';
	let {
		children,
		unknownParamText,
		className
	}: { children: any; unknownParamText?: string; className?: string } = $props();
</script>

<div>
	<div
		class={'sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-gray-200 bg-white p-4 shadow-sm'}
	>
		<Sidebar.Trigger />
		<Breadcrumb {unknownParamText} />
	</div>
	<div class={`h-[calc(100%-3.5rem)] w-full p-4  ${className ?? ''}`}>
		{@render children()}
	</div>
</div>
