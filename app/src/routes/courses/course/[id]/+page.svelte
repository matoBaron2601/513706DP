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
	extraButton={ExtraButton}
>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
		{#each $blockQuery.data as block}
			<CourseBlockCard {block} />
		{/each}
	</div>
</PageWrapper>
