import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createCourseFormSchema } from './createCourseFormSchema';
import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';

export const load = async () => {
	const createCourseForm = await superValidate(zod(createCourseFormSchema));
	return { createCourseForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(createCourseFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		return {
			form
		};
	}
};
