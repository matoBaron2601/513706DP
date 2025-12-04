<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { principles, steps } from './utils/homePageTexts';
	/**
	 * @fileoverview
	 * This is the home page of the application, providing an overview of its structure and core principles.
	 * Route === '/'
	 */
</script>

<PageWrapper breadcrumbItems={[]} classNameWrapper="lg:max-w-[100%] xl:max-w-[100%] w-full">
	<div class="min-h-screen bg-gray-100">
		<main class="flex w-full flex-col gap-16 px-4 pb-16">
			<section
				class="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm"
			>
				<div class="space-y-3">
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Overview</p>
					<h1 class="text-3xl font-semibold tracking-tight text-gray-900">Application overview</h1>
					<p class="max-w-2xl text-sm leading-relaxed text-gray-600">
						The application organises learning into courses, blocks and concepts. For each concept,
						it estimates the user’s skill and generates adaptive quizzes until the concept is
						mastered. This page summarises how courses are structured and how the quiz logic makes
						its decisions.
					</p>
				</div>
			</section>

			<section class="space-y-4">
				<header class="flex items-baseline justify-between gap-4">
					<div>
						<h2 class="text-lg font-semibold text-gray-900">Core principles</h2>
					</div>
				</header>

				<div class="grid gap-4 md:grid-cols-3">
					{#each principles as item}
						<div
							class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
						>
							<h3 class="text-sm font-medium text-gray-900">
								{item.title}
							</h3>
							<p class="text-xs leading-relaxed text-gray-600">
								{item.description}
							</p>
						</div>
					{/each}
				</div>
			</section>

			<section class="space-y-4">
				<header>
					<h2 class="text-lg font-semibold text-gray-900">How the system works</h2>
					<p class="text-sm text-gray-500">
						High-level flow from course creation to everyday usage.
					</p>
				</header>

				<div class="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
					<ol class="space-y-4">
						{#each steps as step, index}
							<li class="flex gap-4">
								<div class="mt-0.5 flex flex-col items-center">
									<div
										class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white"
									>
										{index + 1}
									</div>
									{#if index < steps.length - 1}
										<div class="mt-1 h-full w-px bg-gray-300"></div>
									{/if}
								</div>
								<div class="space-y-1">
									<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
										{step.label}
									</p>
									<h3 class="text-sm font-medium text-gray-900">
										{step.title}
									</h3>
									<p class="text-xs leading-relaxed text-gray-600">
										{step.description}
									</p>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</section>
		</main>
	</div>
</PageWrapper>
