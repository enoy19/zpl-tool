import { env } from '$env/dynamic/public';
import type { Density, Variables } from '$lib/types';
import { renderZplToPng as labelary } from './labelary';
import { renderZplToPng as binarykitsZpl } from './binarykitsZpl';
import { renderZpl } from '$lib/render';

type PreviewGeneratorType = 'binarykits-zpl' | 'labelary' | string;
export const previewGeneratorType: PreviewGeneratorType = env.PUBLIC_PREVIEW_GENERATOR;

export type PreviewGenerator = (
	zpl: string,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
    labelIndex: number
) => Promise<ArrayBuffer>;

export let previewGenerator: PreviewGenerator;

switch (previewGeneratorType) {
	case 'binarykits-zpl': {
		previewGenerator = binarykitsZpl;
		break;
	}
	case 'labelary':{
		previewGenerator = labelary;
        break;
    }
    default: {
        console.warn(`invalid preview generator: ${previewGeneratorType}.`);
        
        previewGenerator = async () => new ArrayBuffer(0);
    }
}

export async function renderZplToPngBase64(
	zplTemplate: string,
	variables: Variables,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
	labelIndex = 0
) {
	const zpl = renderZpl(zplTemplate, variables);

	const pngData = await previewGenerator(zpl, density, widthMillimeter, heightMillimeter, labelIndex);
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
