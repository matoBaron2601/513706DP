<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { ArrowBigRight, Upload } from '@lucide/svelte';
	import CourseBlockCard from './_components/BlockCard.svelte';
	import getBlocks from './_clientServices.ts/getBlocks';
	import getCourseById from '../../../_clientServices/getCourseById';
	const courseId = page.params.id ?? '';

	const courseQuery = createQuery({
		queryKey: ['course', courseId],
		queryFn: async () => await getCourseById(courseId)
	});

	const blockQuery = createQuery({
		queryKey: ['blocks', courseId],
		queryFn: async () => {
			return await getBlocks(courseId);
		}
	});
</script>

{#snippet ExtraButton()}
	<Button
		class="cursor-pointer text-black"
		onclick={async () => await goto(page.url.pathname + '/createBlock')}
	>
		<Upload />
		Create new block
	</Button>
{/snippet}

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${$courseQuery.data?.name}`, isCurrent: true }
	]}
	goBackUrl="/courses"
	extraButton={ExtraButton}
>
	{#if $blockQuery.isLoading}
		<p class="text-sm text-gray-500">Loading…</p>
	{:else if !$blockQuery.data || $blockQuery.data.length === 0}
		<div class="mx-auto mt-10 max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
			<div class="text-4xl mb-3 select-none">📦</div>
			<h2 class="text-lg font-semibold text-gray-900 mb-1">No blocks yet</h2>
			<p class="text-sm text-gray-500 mb-6">
				Add the first block to this course to start building its content.
			</p>
			<Button
				onclick={() => goto(`${page.url.pathname}/createBlock`)}
				class="cursor-pointer text-sm px-4 py-2"
				variant="outline"
			>
				<Upload class="mr-2 h-4 w-4" />
				Create new block
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
			{#each $blockQuery.data as block}
				<CourseBlockCard {block} />
			{/each}
		</div>
	{/if}
</PageWrapper>
