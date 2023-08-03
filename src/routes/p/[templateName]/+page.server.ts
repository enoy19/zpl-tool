import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import neatCsv from 'neat-csv';
import { renderZpl } from '$lib/labelary';
import { templates } from '$lib/server/templates';
import { printerConfigs, printers } from '$lib/server/printers';

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
		} catch(e: any) {
			console.error(e);
			return fail(500, {
				message: e?.message,
			});
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

		const zpl = variableArray.map((variables) => renderZpl(template.zpl, variables)).join('\n');
        
		try {
			await print(zpl, printer);
		} catch(e: any) {
			console.error(e);
			return fail(500, {
				message: e?.message,
			});
		}
	}
};

async function print(zpl: string, printerIdentifier: string) {
	const printer = printers.find(p => p.identifier === printerIdentifier);

	if(!printer) {
		throw new Error(`printer ${printer} not found`);
	}

	await printer.print(zpl);
}
