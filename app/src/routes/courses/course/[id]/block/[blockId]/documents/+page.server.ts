import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types.js';
import { fail } from '@sveltejs/kit';

import { uploadDocumentFormSchema } from './uploadDocumentFormSchema.js';

export const load: PageServerLoad = async () => {
	const uploadDocumentForm = await superValidate(zod(uploadDocumentFormSchema));

	return { uploadDocumentForm };
};

export const actions: Actions = {
	uploadDocument: async (event) => {
		const form = await superValidate(event, zod(uploadDocumentFormSchema));
		if (!form.valid) {
			return fail(400, { uploadDocumentForm: form });
		}
		return { uploadDocumentForm: form };
	}
};
