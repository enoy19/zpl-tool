import { deleteTemplate, setTemplate } from '$lib/server/templates';
import type { Density, Template } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async saveTemplate({ request }) {
		const formData = await request.formData();

		const [templateName, zpl, density, width, height] = [
			'templateName',
			'zpl',
			'density',
			'width',
			'height'
		].map((name) => formData.get(name)?.valueOf());

		if (!templateName || !zpl || !density || !width || !height) {
			return fail(400);
		}

		const template: Template = {
			name: `${templateName}`,
			zpl: `${zpl}`,
			density: `${density as Density}`,
			width: parseFloat(`${width}`),
			height: parseFloat(`${height}`)
		};

		setTemplate(template);

		return;
	},
	async deleteTemplate({ request }) {
		const formData = await request.formData();
		const templateName = formData.get('templateName')?.valueOf();

		if (!templateName || typeof templateName !== 'string') {
			return fail(400);
		}

		await deleteTemplate(templateName);
	}
};
