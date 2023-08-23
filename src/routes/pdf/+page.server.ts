import type { PageServerLoad } from './$types';
import { printerConfigs } from '$lib/server/print/printers';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const printers = Object.keys(printerConfigs);

	return {
		printers
	};
};

export const actions: Actions = {
	async print({ fetch, request }) {
		const formData = await request.formData();

		const pdfFiles = formData.getAll('pdfFiles')?.valueOf();
		const printer = formData.get('printer')?.valueOf();

		if (
			!printer ||
			typeof printer !== 'string' ||
			!pdfFiles ||
			!Array.isArray(pdfFiles) ||
			pdfFiles.length <= 0 ||
			!(pdfFiles[0] instanceof File)
		) {
			return fail(400);
		}

		for (const pdfFile of pdfFiles as File[]) {
			const response = await fetch(`/api/${printer}/pdf`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/pdf'
				},
				body: pdfFile
			});

			if (!response.ok) {
				const body = await response.text();
				return fail(500, {
					message: `failed to print ${pdfFile.name}: [${response.status}] ${body}`
				});
			}
		}
	}
};
