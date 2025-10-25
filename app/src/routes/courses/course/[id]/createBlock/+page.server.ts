import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { createBlockFormSchema } from './createBlockFormSchema.js';

export const load = async () => {
	const createBlockForm = await superValidate(zod(createBlockFormSchema));
	return { createBlockForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(createBlockFormSchema));
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