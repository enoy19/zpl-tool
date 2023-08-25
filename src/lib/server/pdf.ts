import { dpmmToDpi } from './dpiUtils';
import { imageMagick } from './imageMagick';

export async function convertPdfToImage(
	buffer: Buffer,
	page: number,
	dpmm: number,
) {
	const pageSetup = `pdf[${page - 1}]`;

	return new Promise<Buffer>((resolve, reject) => {
		imageMagick(buffer, pageSetup)
			.in('-define', 'pdf:use-cropbox=true')
			.density(dpmmToDpi(dpmm), dpmmToDpi(dpmm))
			.quality(0)
			.compress('jpeg')
			.stream('png', (error, stdout) => {
				const buffers: Buffer[] = [];

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
}
