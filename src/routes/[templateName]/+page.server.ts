import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SerialPort } from 'serialport';
import neatCsv from 'neat-csv';
import { renderZpl } from '$lib/labelary';
import { templates } from '$lib/server/templates';

export const actions: Actions = {
	async print({ request }) {
		const formData = await request.formData();

		const zpl = formData.get('zpl')?.valueOf();

		if (!zpl || typeof zpl !== 'string') {
			return fail(400);
		}

		await print(zpl);
	},
	async printBulk({ request, params }) {
		const formData = await request.formData();
		const csvFile = formData.get('csv')?.valueOf();

		if (!(csvFile instanceof File)) {
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
        await print(zpl);
	}
};

async function print(zpl: string) {
	const port = new SerialPort({
		path: '/dev/rfcomm0',
		baudRate: 9600 // TODO: adjust if needed
	});

	try {
		await new Promise((resolve, reject) => {
			port.write(zpl, (err) => {
				if (err) {
					console.error('Error writing to port:', err);
					reject(err);
				} else {
					console.log('Message sent');
					resolve(undefined);
				}
			});
		});
	} finally {
		port.close();
	}
}
