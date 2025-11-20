<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import getCourses from './_clientServices/getCourses';
	import CourseCard from './_components/CourseCard.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { getUserByEmail, getUserFromPage } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	const user = getUserFromPage();
	const getCoursesQuery = createQuery({
		queryKey: ['courses'],
		queryFn: async () => {
			const { id } = await getUserByEmail(user.email);
			return await getCourses({ sortBy: 'name', sortDir: 'asc', creatorId: id });
		}
	});
</script>

<PageWrapper
	breadcrumbItems={[{ text: 'Courses', href: '/courses', isCurrent: true }]}
	goBackUrl="/"
>
	{#if $getCoursesQuery.isLoading}
		<p class="text-sm text-gray-500">Loading…</p>
	{:else if !$getCoursesQuery.data || $getCoursesQuery.data.length === 0}
		<div class="mx-auto mt-10 max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
			<div class="text-4xl mb-3 select-none">📚</div>
			<h2 class="text-lg font-semibold text-gray-900 mb-1">No courses to attend yet</h2>
			<p class="text-sm text-gray-500 mb-6">
				Start by creating your first course. You can add blocks and concepts later.
			</p>
			<Button
				class="cursor-pointer"
				onclick={() => goto('/courses/create')}
			>
				Create new course
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each $getCoursesQuery.data as course}
				<CourseCard {course} />
			{/each}
		</div>
	{/if}
</PageWrapper>

