import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { submitAnswerFormSchema } from './submitAnswerFormSchema';

export const load = async () => {
	const submitAnswerForm = await superValidate(zod(submitAnswerFormSchema));
	return { submitAnswerForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(submitAnswerFormSchema));
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
