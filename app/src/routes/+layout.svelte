<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import queryClient from './queryClient';
	import { onMount } from 'svelte';
	import { userDataStore } from '$lib/stores/userDataStore';
	import { getUserByEmail } from '$lib/utils';

	let { children } = $props();
	onMount(async () => {
		const user = await getUserByEmail(page.data.session?.user?.email ?? '');
		userDataStore.update(() => ({
			userId: user.id,
			userEmail: user.email,
			userName: user.name,
			profilePicture: user.profilePicture
		}));
	});
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
