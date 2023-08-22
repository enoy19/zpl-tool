import { printerConfigs } from '$lib/server/print/printers';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const responseBody = {
		printers: Object.keys(printerConfigs).map((key) => {
			return {
				identifier: key,
				uriEncoded: encodeURIComponent(key)
			};
		})
	};

	return json(responseBody);
};
