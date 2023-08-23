import { print } from '$lib/server/print';
import { text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	return text(`Make a POST Request on ${url.toString()}`);
};

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { printer: printerIdentifier } = params;

		if (!printerIdentifier) {
			throw new Error(`invalid printer: ${printerIdentifier}`);
		}

		const zpl = await request.text();
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
