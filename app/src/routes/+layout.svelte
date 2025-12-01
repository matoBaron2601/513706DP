<script lang="ts">
	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import queryClient from './queryClient';

	import hed from './hed.png';
	import hed2 from './hed2.png';
	import todbubble from './todbubble.png';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onDestroy, onMount } from 'svelte';

	let { children } = $props();
	let currentQuote = $state('');

	const learningQuotes: string[] = [
		'Every mistake is a lesson in disguise.',
		'Learning to code is like learning a new language; immerse yourself!',
		'Curiosity is the fuel of innovation.',
		'The more you practice, the more confident you become!',
		'Feedback is your friend; embrace it!',
		'Discovering new concepts is the thrill of coding.',
		'Each snippet of code is a stepping stone to mastery.',
		'Remember, learning is a continuous process—never stop exploring!',
		'A problem shared is a problem solved—collaboration is key!',
		'Take small steps; progress is progress!',
		'Celebrate your small wins; they lead to big successes.',
		'Learning coding principles is like learning the rules to a game.',
		'Spent time learning is an investment in your future.',
		'Dive deep into documentation; it’s full of treasures!',
		'Make mistakes; that’s how the best programmers grow.',
		'Learning TypeScript improves your JavaScript skills!',
		'Practice makes perfect—commit to daily coding!',
		'Ask questions; every inquiry leads to understanding!',
		'The fear of failure fades with experience.',
		'Code reviews are a great learning opportunity!',
		'Stay patient; mastery takes time and perseverance.',
		'Every program you write sharpens your skills.',
		'Explore new libraries; they can broaden your skillset.',
		'Adopt a growth mindset—your abilities can improve with effort!',
		'Keep pushing your boundaries; comfort zones are for the lazy!',
		'Each challenge is a lesson, so approach it with an open mind.',
		'Learning is a marathon, not a sprint.',
		'Take breaks; your mind needs time to process new information.',
		'Coding is as much about reading as it is about writing.',
		'Participate in hackathons to boost your learning experience!',
		'Contribution to open source is a priceless learning opportunity.',
		'Writing code daily keeps your skills sharp.',
		'Be open to new ideas; innovation thrives on adaptability.',
		'Embrace constructive criticism; it leads to growth.',
		'Study the masters; their code teaches invaluable lessons.',
		'Consistency beats intensity—code a little bit every day!',
		'The best way to learn is to teach others.',
		'Learning from others’ code can spark new ideas.',
		'Explore the community—networking can lead to new insights!',
		'Set realistic goals; each small target reached is progress.',
		"Reflect on what you've learned; it solidifies knowledge.",
		'Every line of code written today adds to your future skills.',
		"Stay hungry for knowledge; there's always more to learn!",
		'Each concept you grasp opens doors to new possibilities.'
	];

	function pickRandomQuote() {
		currentQuote = learningQuotes[Math.floor(Math.random() * learningQuotes.length)];
	}

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
					class="pointer-events-none fixed bottom-10 right-30 z-20 hidden flex-col items-center gap-4 2xl:flex"
				>
					<div class="pointer-events-auto relative w-[240px]">
						<img
							src={todbubble}
							alt="Speech bubble"
							class="w-[240px] select-none drop-shadow-md translate-y-5.5"
							draggable="false"
						/>
						<p class="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-medium text-gray-800">
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
