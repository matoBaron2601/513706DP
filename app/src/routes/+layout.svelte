<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import queryClient from './queryClient';

	let { children } = $props();

</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Sidebar.Provider>
		{#if page.data.session}
			<AppSidebar />
		{/if}
		<main class="w-full">
			{@render children?.()}
		</main>
	</Sidebar.Provider>
</QueryClientProvider>
