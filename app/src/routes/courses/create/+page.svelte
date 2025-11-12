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
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toast } from 'svelte-sonner';

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
				creatorId: userId.id,
				published: true
			});
			goto('/courses');
		},

		onSuccess: () => {
			toast.success('Course created successfully');
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

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: 'Create', isCurrent: true }
	]}
	goBackUrl="/courses"
>
	<form method="POST" use:enhance class="p-4" onsubmit={handleFormSubmit}>
		<Card.Title class="text-xl">Create New Course</Card.Title>
		<Card.Card class="mx-auto mt-4">
			<Card.Content class="flex flex-col gap-6">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input class="" {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.Description>Specify course name</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="published">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Publish</Form.Label>
							<Checkbox {...props} class="cursor-pointer" bind:checked={$formData.published} />
						{/snippet}
					</Form.Control>
					<Form.Description>Specify course publication status</Form.Description>

					<Form.FieldErrors />
				</Form.Field>
				<div class="flex justify-end">
					<Button type="submit" class="cursor-pointer " disabled={$createCourseMutation.isPending}>
						{#if $createCourseMutation.isPending}
							<Spinner />
						{:else}
							Create
						{/if}
					</Button>
				</div>
			</Card.Content>
		</Card.Card>
	</form>
</PageWrapper>
