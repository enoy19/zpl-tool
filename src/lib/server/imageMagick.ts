import gm from 'gm';

export const imageMagick = gm.subClass({ imageMagick: '7+' });

export function identify(image: Buffer): Promise<gm.ImageInfo> {
	return new Promise((resolve, reject) => {
		imageMagick(image).identify((err, value) => {
			if (err) {
				reject(err);
			}

			resolve(value);
		});
	});
}
