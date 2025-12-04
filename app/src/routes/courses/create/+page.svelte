<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
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
	import { toast } from 'svelte-sonner';
	import { createCourse } from './_clientService.ts/createCourse';

	/**
	 * @fileoverview
	 * This Svelte component provides a user interface for creating a new course. It includes a form
	 * where users can input the course name. Upon submission, it validates the input using Zod schema
	 * and sends a request to create the course. Successful creation redirects the user to the courses list
	 * and displays a success toast notification.
	 * Route === '/courses/create'
	 */

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
				published: false
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
	<form method="POST" use:enhance onsubmit={handleFormSubmit}>
		<div class="space-y-4">
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Create new course</h1>
			<p class="text-sm text-gray-500">Define the basic information for your new course.</p>
		</div>

		<Card.Card class="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
			<Card.Content class="flex flex-col gap-6 px-6 py-6">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<div class="space-y-2">
								<Form.Label>Name</Form.Label>
								<Input
									{...props}
									bind:value={$formData.name}
									class="w-full"
									placeholder="e.g. PB138 Web Dev and Markup Languages"
								/>
							</div>
						{/snippet}
					</Form.Control>
					<p class="mt-1 text-xs text-gray-500">
						Specify a clear and recognizable name for the course.
					</p>
					<Form.FieldErrors />
				</Form.Field>

				<div class="flex justify-end">
					<Button
						type="submit"
						class="cursor-pointer px-5"
						disabled={$createCourseMutation.isPending}
					>
						{#if $createCourseMutation.isPending}
							<Spinner />
						{:else}
							Create course
						{/if}
					</Button>
				</div>
			</Card.Content>
		</Card.Card>
	</form>
</PageWrapper>
