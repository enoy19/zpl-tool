import { printerConfigs } from '$lib/server/print/printers';
import { templates } from '$lib/server/templates';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const responseBody = {
		templates: Object.keys(templates).map((key) => {
			return {
				identifier: key,
				uriEncoded: encodeURIComponent(key)
			};
		}),
		printers: Object.keys(printerConfigs).map((key) => {
			return {
				identifier: key,
				uriEncoded: encodeURIComponent(key),
				url: `${url.toString()}/${encodeURIComponent(key)}`
			};
		})
	};

	return json(responseBody);
};
