import type { BinarykitsZplRequestBody, Density } from '$lib/types';

export async function renderZplToPng(
	zpl: string,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number
) {
	const body: BinarykitsZplRequestBody = {
		zpl,
		dpmm: parseInt(density.split('dpmm')[0]),
		width: widthMillimeter,
		height: heightMillimeter
	};

	// TODO: binarykits-zpl env var
	const response = await fetch('/api/binarykits-zpl', {
		method: 'POST',
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`[${response.status}] Generating preview failed: ${responseText}`);
	}

	return response.arrayBuffer();
}
