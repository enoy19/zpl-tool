import { print } from '$lib/server/print';
import { text, type RequestHandler } from '@sveltejs/kit';
import { printerConfigs } from '$lib/server/print/printers';
import { mmToPixels } from '$lib/dpiUtils';
import { imageToZpl, pdfToImage } from '$lib/server/image';

export const GET: RequestHandler = async ({ url }) => {
	return text(`Make a POST Request on ${url.toString()} with the pdf in the body`);
};

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { printer, printerIdentifier } = getPrinter(params);

		const { width, height } = mmToPixels(printer.dpmm, printer.widthMm, printer.heightMm);

		const image = await pdfToImage(Buffer.from(await request.arrayBuffer()));
		const zpl = await imageToZpl(image, width, height, printer.dpmm);

		await print(zpl, printerIdentifier);

		return text('DONE');
	} catch (e) {
		if (e instanceof Error) {
			return new Response(e.message, {
				status: 400
			});
		}
		throw e;
	}
};
function getPrinter(params: Partial<Record<string, string>>) {
	const { printer: printerIdentifier } = params;

	if (!printerIdentifier) {
		throw new Error(`invalid printer: ${printerIdentifier}`);
	}

	const printer = printerConfigs[printerIdentifier];

	if (!printer) {
		throw new Error(`invalid printer: ${printerIdentifier}`);
	}

	return { printer, printerIdentifier };
}
