import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { createCourseBlockFormSchema } from './createCourseBlockSchema.js';

export const load = async () => {
	const createCourseBlockForm = await superValidate(zod(createCourseBlockFormSchema));
	return { createCourseBlockForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(createCourseBlockFormSchema));
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
