import { renderZpl } from './render';
import type { Density, Variables } from './types';

export async function renderZplToPngBase64(
	zpl: string,
	variables: Variables,
	density: Density,
	widthMillimeter: number,
	heightMillimeter: number,
	labelIndex = 0
) {
	const formData = new FormData();

	const fileContent = renderZpl(zpl, variables);
	const fileBlob = new Blob([fileContent], { type: 'text/plain' });
	formData.append('file', fileBlob, 'blob');
	formData.append('_charset_', 'UTF-8');

	const response = await fetch(
		`https://api.labelary.com/v1/printers/${density}/labels/${millimetersToInches(
			widthMillimeter
		)}x${millimetersToInches(heightMillimeter)}/${labelIndex}/`,
		{
			method: 'POST',
			body: formData,
			headers: {
				Accept: 'image/png'
			}
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText);
	}

	return blobToBase64(await response.blob());
}

function millimetersToInches(mm: number) {
	return (mm / 25.4).toFixed(10);
}

async function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onloadend = () => {
			const base64data = reader.result as string;
			resolve(base64data.split(',')[1]);
		};

		reader.onerror = () => reject(new Error('An error occurred reading the blob'));

		reader.readAsDataURL(blob);
	});
}
