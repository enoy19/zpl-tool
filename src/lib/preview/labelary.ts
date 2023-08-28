import type { Density } from '../types';

export async function renderZplToPng(
	zpl: string,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
	labelIndex = 0
) {
	const formData = new FormData();

	const fileBlob = new Blob([zpl], { type: 'text/plain' });
	formData.append('file', fileBlob, 'blob');
	formData.append('_charset_', 'UTF-8');

	const url = `https://api.labelary.com/v1/printers/${density}/labels/${millimetersToInches(
		widthMillimeter
	)}x${millimetersToInches(heightMillimeter)}/${labelIndex}/`;

	const response = await fetch(url, {
		method: 'POST',
		body: formData,
		headers: {
			Accept: 'image/png'
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText);
	}

	return blobToArrayBuffer(await response.blob());
}

function millimetersToInches(mm: number) {
	return (mm / 25.4).toFixed(10);
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onloadend = () => {
			if (reader.result instanceof ArrayBuffer) {
				resolve(reader.result);
			} else {
				reject(new Error('blob read result is not array buffer'));
			}
		};

		reader.onerror = () => reject(new Error('An error occurred reading the blob'));

		reader.readAsArrayBuffer(blob);
	});
}
