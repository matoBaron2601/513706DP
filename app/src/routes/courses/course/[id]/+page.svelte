<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { Upload } from '@lucide/svelte';
	import CourseBlockCard from './_components/BlockCard.svelte';
	import getBlocks from './_clientServices.ts/getBlocks';
	const courseId = page.params.id ?? '';

	const blockQuery = createQuery({
		queryKey: ['blocks', courseId],
		queryFn: async () => {
			return await getBlocks(courseId);
		}
	});
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Course', href: `/course/${courseId}`, isCurrent: true },
		{ text: courseId, href: `/course/${courseId}`, isCurrent: true }
	]}
>
	<Button
		class="cursor-pointer text-black absolute right-8 top-20"
		onclick={async () => await goto(page.url.pathname + '/createBlock')}
	>
		<Upload />
		Create block</Button
	>
	<div class="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each $blockQuery.data as block}
			<CourseBlockCard {block} />
		{/each}
	</div>
</PageWrapper>
