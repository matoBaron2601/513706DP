<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';

	const principles = [
		{
			title: 'Mastery over completion',
			description:
				'The goal is not to “finish a block” but to master every concept in it. A block is completed only when all concepts reach the mastery criteria, not when a fixed number of quizzes has been done.'
		},
		{
			title: 'Concept-level skill modelling',
			description:
				'Each block is broken down into concepts extracted from a primary document. The system tracks a separate skill estimate for every concept and updates it after every quiz attempt.'
		},
		{
			title: 'Probabilistic, per-user adaptation',
			description:
				'User skill is estimated with a Bayesian Beta model based only on that user’s answers. All decisions (which concepts to ask, how many questions, which types) are made per user and are unaffected by other users.'
		},
		{
			title: 'Balanced theory and practice',
			description:
				'Each concept is tested across four question types (A1, A2, B1, B2), covering both theoretical understanding and practical application, so users do not overfit to one format.'
		},
		{
			title: 'Uncertainty-aware decisions',
			description:
				'The system considers both the estimated skill and its uncertainty. Concepts with low score or high uncertainty are prioritised, while confident high-skill concepts are gradually phased out.'
		},
		{
			title: 'Transparent, parameter-driven behaviour',
			description:
				'All key behaviours (mastery threshold, streak requirement, minimum questions, exploration strength) are controlled by explicit parameters that can be tuned without changing the core logic.'
		}
	];

	const steps = [
		{
			label: 'Course setup',
			title: 'Create course, blocks and upload documents',
			description:
				'The course creator defines a course, splits it into blocks and uploads one primary document per block. Concepts are then extracted from each document and attached to the corresponding block.'
		},
		{
			label: 'Initial assessment',
			title: 'Run the block placement quiz',
			description:
				'For every concept in a block, the system generates exactly one question of each type (A1, A2, B1, B2). This placement quiz gives four answers per concept as the starting skill estimate.'
		},
		{
			label: 'Initial skill model',
			title: 'Estimate concept skills with a Beta prior',
			description:
				'Using a Beta(α0 = 1, β0 = 1) prior, correct and asked counts from the placement quiz are aggregated per concept. From these, the system computes an initial score (mean of the Beta) and variance for each concept.'
		},
		{
			label: 'Adaptive loop',
			title: 'Select concepts and allocate questions',
			description:
				'After every quiz, non-mastered concepts are scored by priority using their current skill and uncertainty. The top three concepts are picked, and an adaptive number of follow-up questions is allocated to each, then distributed across question types according to per-type deficits.'
		},
		{
			label: 'Update and re-evaluate',
			title: 'Update counts, Beta parameters and mastery',
			description:
				'Once the user submits a quiz, per-type counts (correct and asked) are updated. These are aggregated to update α, β, score, variance and the streak for each concept. The system then checks if mastery criteria are now satisfied.'
		},
		{
			label: 'Completion',
			title: 'Mark concepts and blocks as mastered',
			description:
				'When a concept meets all mastery conditions, it is marked as mastered and removed from further scheduling. A block is marked as completed when all its concepts are mastered, and the user can move on within the course.'
		}
	];
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
