import { env } from '$env/dynamic/public';
import { getVariableNames, renderZpl } from '$lib/render';
import { print } from '$lib/server/print';
import { templates } from '$lib/server/templates';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { templateIdentifier, printerIdentifier } = getAndValidateParams(params);

		const template = templates[templateIdentifier];
		const variables = getVariableNames(template.zpl);
		const exampleObject: Record<string, string> = {};

		for (const variable of variables) {
			exampleObject[variable] = '<value>';
		}

		const exampleJson = JSON.stringify(exampleObject, undefined, 2);

		return new Response(`Make a POST Request on ${env.PUBLIC_BASE_URL}/api/${encodeURIComponent(
			templateIdentifier
		)}/${encodeURIComponent(printerIdentifier)}
Example Body (application/json):
${exampleJson}    
    `);
	} catch (e) {
		if (e instanceof Error) {
			return new Response(e.message, {
				status: 400
			});
		}
		throw e;
	}
};

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { templateIdentifier, printerIdentifier } = getAndValidateParams(params);
		const template = templates[templateIdentifier];

		if (!template) {
			return new Response(`template ${templateIdentifier} not found`, { status: 404 });
		}

		const body = await request.json();
		const variables = Array.isArray(body) ? body : [body];

		const renderedZpl = renderZpl(template.zpl, ...variables);
		await print(renderedZpl, printerIdentifier);

		return new Response('DONE');
	} catch (e) {
		if (e instanceof Error) {
			return new Response(e.message, {
				status: 400
			});
		}
		throw e;
	}
};

function getAndValidateParams(params: Partial<Record<string, string>>) {
	const { template: templateIdentifier, printer: printerIdentifier } = params;

	if (!templateIdentifier) {
		throw new Error(`invalid template: ${templateIdentifier}`);
	}

	if (!printerIdentifier) {
		throw new Error(`invalid printer: ${printerIdentifier}`);
	}

	return {
		templateIdentifier,
		printerIdentifier
	};
}
