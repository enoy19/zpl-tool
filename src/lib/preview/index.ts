import { renderZpl } from '$lib/render';
import type { Density, Variables } from '$lib/types';
import { renderZplToPng as binarykitsZpl } from './binarykitsZpl';
import { renderZplToPng as labelary } from './labelary';

export const previewGeneratorTypes = ['labelary', 'binarykitsZpl'] as const;
export type PreviewGeneratorType = (typeof previewGeneratorTypes)[number];

export type PreviewGenerator = (
	zpl: string,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
	labelIndex: number
) => Promise<ArrayBuffer>;

export const previewGenerators = {
	binarykitsZpl,
	labelary
};

export async function renderZplToPngBase64(
	generator: PreviewGeneratorType,
	zplTemplate: string,
	variables: Variables,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
	labelIndex = 0
) {
	const previewGenerator = previewGenerators[generator];

	const zpl = renderZpl(zplTemplate, variables);

	const pngData = await previewGenerator(
		zpl,
		density,
		widthMillimeter,
		heightMillimeter,
		labelIndex
	);
	return arrayBufferToBase64(pngData);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
	let binary = '';
	const data = new Uint8Array(buffer);
	for (let i = 0; i < data.byteLength; i++) {
		binary += String.fromCharCode(data[i]);
	}
	return window.btoa(binary);
}
