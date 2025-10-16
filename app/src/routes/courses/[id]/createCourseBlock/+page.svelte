<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import { getUserFromPage } from '$lib/utils';
	import type { UserDto } from '../../../../db/schema';
	import createCourseBlock from './clientServices.ts/createCourseBlock';
	import { page } from '$app/state';

	const courseId = page.params.id ?? '';
	const user = getUserFromPage();

	const createCourseBlockMutation = createMutation({
		mutationKey: ['createCourseBlock'],
		mutationFn: async () => {
			const userId: UserDto = await fetch(`/api/auth/email/${user?.email}`).then((res) =>
				res.json()
			);
			await createCourseBlock({
				name: 'New Course Block 2',
				courseId: courseId
			});
			goto(`/courses/${courseId}`);
		}
	});
</script>

<div>
	<Button onclick={async () => await $createCourseBlockMutation.mutateAsync()}
		>Submit Form</Button
	>
</div>
