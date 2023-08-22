import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import neatCsv from 'neat-csv';
import { templates } from '$lib/server/templates';
import { printerConfigs } from '$lib/server/print/printers';
import { print } from '$lib/server/print';
import { renderZpl } from '$lib/render';

export const load: PageServerLoad = async () => {
	const printers = Object.keys(printerConfigs);

	return {
		printers
	};
};

export const actions: Actions = {
	async print({ request }) {
		const formData = await request.formData();

		const zpl = formData.get('zpl')?.valueOf();
		const printer = formData.get('printer')?.valueOf();

		if (!zpl || typeof zpl !== 'string' || !printer || typeof printer !== 'string') {
			return fail(400);
		}

		try {
			await print(zpl, printer);
		} catch (e: unknown) {
			console.error(e);

			if (e instanceof Error) {
				return fail(500, {
					message: e.message
				});
			}

			throw e;
		}
	},
	async printBulk({ request, params }) {
		const formData = await request.formData();
		const csvFile = formData.get('csv')?.valueOf();
		const printer = formData.get('printer')?.valueOf();

		if (!(csvFile instanceof File) || !printer || typeof printer !== 'string') {
			return fail(400);
		}

		const csvText = await csvFile.text();
		const variableArray = await neatCsv(csvText, {
			quote: '"',
			separator: ';'
		});

		const template = templates[params.templateName];

		if (!template) {
			return fail(404);
		}

		const zpl = renderZpl(template.zpl, ...variableArray);

		try {
			await print(zpl, printer);
		} catch (e: unknown) {
			console.error(e);

			if (e instanceof Error) {
				return fail(500, {
					message: e.message
				});
			}

			throw e;
		}
	}
};
