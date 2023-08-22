import { deletePrinter, printerConfigs, savePrinter } from '$lib/server/print/printers';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { PrinterType } from '$lib/types';
import { printerTypes } from '$lib/constants';

export const load: PageServerLoad = async () => {
	return {
		printerConfigs
	};
};

export const actions: Actions = {
	async savePrinter({ request }) {
		const formData = await request.formData();

		const typeString = formData.get('type')?.valueOf();
		const identifier = formData.get('identifier')?.valueOf();
		const newIdentifier = formData.get('newIdentifier')?.valueOf();

		if (
			!typeString ||
			typeof typeString !== 'string' ||
			!identifier ||
			typeof identifier !== 'string' ||
			!newIdentifier ||
			typeof newIdentifier !== 'string'
		) {
			return fail(400);
		}

		if (!printerTypes.includes(typeString as PrinterType)) {
			return fail(400, { message: 'invalid printer type' });
		}

		const type = typeString as PrinterType;

		switch (typeString as PrinterType) {
			case 'serial': {
				const path = formData.get('path')?.valueOf();
				const baudRate = formData.get('baudRate')?.valueOf();

				if (!path || typeof path !== 'string' || !baudRate || typeof baudRate !== 'string') {
					return fail(400);
				}

				await savePrinter(identifier, newIdentifier, type, {
					path,
					baudRate: parseInt(baudRate)
				});

				break;
			}
			case 'tcp': {
				const host = formData.get('host')?.valueOf();
				const port = formData.get('port')?.valueOf();

				if (!host || typeof host !== 'string' || !port || typeof port !== 'string') {
					return fail(400);
				}

				await savePrinter(identifier, newIdentifier, type, {
					host,
					port: parseInt(port)
				});

				break;
			}
			default:
				console.error(`unknown printer type: ${type}`);
				return fail(500);
		}
	},
	async deletePrinter({ request }) {
		const formData = await request.formData();
		const identifier = formData.get('identifier')?.valueOf();

		if (!identifier || typeof identifier !== 'string') {
			return fail(400);
		}

		await deletePrinter(identifier);
	}
};
