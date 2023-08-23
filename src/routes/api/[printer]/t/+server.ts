import { templates } from '$lib/server/templates';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const responseBody = {
		templates: Object.keys(templates).map((key) => {
			return {
				identifier: key,
				uriEncoded: encodeURIComponent(key),
				url: `${url.toString()}/t/${encodeURIComponent(key)}`
			};
		})
	};

	return json(responseBody);
};
