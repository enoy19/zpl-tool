import { dev } from '$app/environment';
import { mkdirIfNotExists, writeDataFile } from './fileUtil';
import { imageMagick } from './imageMagick';

export async function convertPdfToImage(buffer: Buffer, page: number) {
	const pageSetup = `pdf[${page - 1}]`;

	const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
		imageMagick(buffer, pageSetup)
			.in('-define', 'pdf:use-cropbox=true', '-alpha', 'remove')
			.density(300, 300)
			.background('#ffffff')
			.stream('jpg', (error, stdout, _, cmd) => {
				const buffers: Buffer[] = [];

				if (dev) {
					console.debug(`PDF: ${cmd}`);
				}

				if (error) {
					reject(error);
					return;
				}

				stdout
					.on('data', (data) => {
						buffers.push(data);
					})
					.on('end', () => {
						return resolve(Buffer.concat(buffers));
					});
			});
	});

	if (dev) {
		await mkdirIfNotExists('debug');

		const filename = Date.now();
		await writeDataFile(`debug/${filename}.pdf.png`, imageBuffer);
	}

	return imageBuffer;
}
