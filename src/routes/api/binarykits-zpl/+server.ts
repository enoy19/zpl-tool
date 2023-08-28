import type { RequestHandler } from './$types';
import type { BinarykitsZplRequestBody } from '$lib/types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const { zpl, dpmm, width, height }: BinarykitsZplRequestBody = await request.json();

	const png = await renderZplToPng(zpl, dpmm, width, height);

	return new Response(png);
};

type BinaryKitsZplResponseBody = {
	nonSupportedCommands: string[];
	labels: {
		imageBase64: string;
	}[];
};

async function renderZplToPng(
	zpl: string,
	density: number,
	width: number,
	height: number,
	labelIndex = 0
) {
	const body = JSON.stringify({
		zplData: zpl,
		printDensityDpmm: density,
		labelWidth: width,
		labelHeight: height
	});

	const response = await fetch(`${env.SECRET_BINARYKITS_ZPL_BASE_URL}/api/v1/viewer`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`[${response.status}] ${responseText}`);
	}

	const responseBody: BinaryKitsZplResponseBody = await response.json();

	if (responseBody.nonSupportedCommands.length > 0) {
		console.warn(`Preview nonSupportedCommands: ${responseBody.nonSupportedCommands.join(', ')}`);
	}

	return Buffer.from(responseBody.labels[labelIndex].imageBase64, 'base64');
}
