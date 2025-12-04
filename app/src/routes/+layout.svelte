<script lang="ts">
	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import queryClient from './queryClient';

	import { Toaster } from '$lib/components/ui/sonner';
	import { onDestroy, onMount } from 'svelte';
	import hed from '$lib/components/assets/hed.png';
	import hed2 from '$lib/components/assets/hed2.png';
	import todbubble from '$lib/components/assets/todbubble.png';
	import { learningQuotes } from '$lib/utils';

	/**
	 * @fileoverview
	 * This is the root layout component for the application. It sets up the main structure, including the sidebar,
	 * toast notifications, and a dynamic learning quote feature that updates every 10 seconds.
	 * It also conditionally renders the sidebar based on user session data.
	 * Route === '/*'
	 */

	let { children } = $props();
	let currentQuote = $state('');

	const pickRandomQuote = () => {
		currentQuote = learningQuotes[Math.floor(Math.random() * learningQuotes.length)];
	};

	onMount(() => {
		pickRandomQuote();

		const interval = setInterval(() => {
			pickRandomQuote();
		}, 10000);

		onDestroy(() => {
			clearInterval(interval);
		});
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={hed} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Toaster />

	<Sidebar.Provider>
		{#if page.data.session}
			<AppSidebar />
		{/if}
		<main class="w-full bg-gray-100">
			{@render children?.()}

			{#if page.url.pathname !== '/'}
				<div
					class="right-30 pointer-events-none fixed bottom-10 z-20 hidden flex-col items-center gap-4 2xl:flex"
				>
					<div class="pointer-events-auto relative w-[240px]">
						<img
							src={todbubble}
							alt="Speech bubble"
							class="translate-y-5.5 w-[240px] select-none drop-shadow-md"
							draggable="false"
						/>
						<p
							class="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-medium text-gray-800"
						>
							{currentQuote}
						</p>
					</div>

					<img
						src={hed2}
						alt="Owl mascot"
						class="pointer-events-auto w-[200px] select-none drop-shadow-md"
						draggable="false"
					/>
				</div>
			{/if}
		</main>
	</Sidebar.Provider>
</QueryClientProvider>
