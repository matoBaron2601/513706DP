<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import createCourse from './_clientService.ts/createCourse';
	import { getUserFromPage } from '$lib/utils';
	import type { UserDto } from '../../../db/schema';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import type { PageData } from './$types.js';
	import { createCourseFormSchema } from './createCourseFormSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data }: { data: PageData } = $props();

	const user = getUserFromPage();
	const createCourseMutation = createMutation({
		mutationKey: ['createCourse'],
		mutationFn: async () => {
			const userId: UserDto = await fetch(`/api/auth/email/${user?.email}`).then((res) =>
				res.json()
			);
			await createCourse({
				name: $formData.name,
				creatorId: userId.id
			});
			goto('/courses');
		}
	});

	const form = superForm(data.createCourseForm, {
		validators: zodClient(createCourseFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (isValid) {
			await $createCourseMutation.mutateAsync();
		}
	};
</script>

<PageWrapper>
	<form method="POST" use:enhance class="mx-auto p-4 md:w-[50%]" onsubmit={handleFormSubmit}>
		<Card.Title class="text-xl">Create New Course</Card.Title>
		<Card.Card class="mx-auto mt-4">
			<Card.Content class="flex flex-col gap-6">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.Description>Specify course name</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Button
					type="submit"
					class="mx-auto w-full cursor-pointer lg:w-[50%]"
					disabled={$createCourseMutation.isPending}
				>
					{#if $createCourseMutation.isPending}
						<Spinner />
					{:else}
						Create Course
					{/if}
				</Button>
			</Card.Content>
		</Card.Card>
	</form>
</PageWrapper>
