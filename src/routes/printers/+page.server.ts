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
		const dpmmString = formData.get('dpmm')?.valueOf();
		const widthMmString = formData.get('widthMm')?.valueOf();
		const heightMmString = formData.get('heightMm')?.valueOf();

		if (
			!isString(typeString) ||
			!isString(identifier) ||
			!isString(newIdentifier) ||
			!isString(dpmmString) ||
			!isString(widthMmString) ||
			!isString(heightMmString)
		) {
			return fail(400);
		}

		if (!printerTypes.includes(typeString as PrinterType)) {
			return fail(400, { message: 'invalid printer type' });
		}

		const type = typeString as PrinterType;

		const dpmm = parseFloat(dpmmString as string);
		const widthMm = parseFloat(widthMmString as string);
		const heightMm = parseFloat(heightMmString as string);

		if (isNaN(dpmm) || isNaN(widthMm) || isNaN(heightMm)) {
			return fail(400, { message: 'invalid dpmm, width or height' });
		}

		switch (typeString as PrinterType) {
			case 'serial': {
				const path = formData.get('path')?.valueOf();
				const baudRate = formData.get('baudRate')?.valueOf();

				if (!path || typeof path !== 'string' || !baudRate || typeof baudRate !== 'string') {
					return fail(400);
				}

				await savePrinter(
					identifier as string,
					newIdentifier as string,
					dpmm,
					widthMm,
					heightMm,
					type,
					{
						path,
						baudRate: parseInt(baudRate)
					}
				);

				break;
			}
			case 'tcp': {
				const host = formData.get('host')?.valueOf();
				const port = formData.get('port')?.valueOf();

				if (!host || typeof host !== 'string' || !port || typeof port !== 'string') {
					return fail(400);
				}

				await savePrinter(
					identifier as string,
					newIdentifier as string,
					dpmm,
					widthMm,
					heightMm,
					type,
					{
						host,
						port: parseInt(port)
					}
				);

				break;
			}
			case 'debug': {
				await savePrinter(
					identifier as string,
					newIdentifier as string,
					dpmm,
					widthMm,
					heightMm,
					type,
					{} as never
				);

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

function isString(string: unknown) {
	if (!string || typeof string !== 'string') {
		return false;
	}

	return true;
}
