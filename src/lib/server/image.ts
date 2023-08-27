import { convertPdfToImage } from './pdf';
import { identify, imageMagick } from './imageMagick';

export async function imageToZpl(
	input: Buffer,
	width: number,
	height: number,
	thresholdPercent = 75
) {
	const metadata = await identify(input);

	const rotation = calculateRotation(
		{
			width: metadata.size.width ?? 1,
			height: metadata.size.height ?? 1
		},
		{
			width,
			height
		}
	);

	const paddedWidth = width + getPadding(width, 8);

	const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
		imageMagick(input)
			.background('#FFFFFF')
			.flatten()
			.rotate('black', rotation)
			.resize(paddedWidth, height, '!')
			.threshold(thresholdPercent, true)
			.negative()
			.bitdepth(8)
			.setFormat('rgb')
			.toBuffer((err, buffer) => {
				if (err) {
					reject(err);
				} else {
					resolve(buffer);
				}
			});
	});

	const redBuffer = Buffer.alloc(imageBuffer.length / 3);

	// Iterate through the buffer, pulling out only the Red values.
	for (let i = 0, j = 0; i < imageBuffer.length; i += 3, j++) {
		redBuffer[j] = imageBuffer[i];
	}

	const monochromeBuffer = bufferToBitBuffer(redBuffer);

	const totalBytes = monochromeBuffer.byteLength;
	const hexString = monochromeBuffer.toString('hex');

	return `^XA^FO0,0^GFA,${totalBytes},${totalBytes},${Math.ceil(paddedWidth / 8)},${hexString}^XZ`;
}

export async function pdfToImage(buffer: Buffer | ArrayBuffer) {
	const pdfDataBuffer = Buffer.from(buffer);
	const image = await convertPdfToImage(pdfDataBuffer, 1);

	return image;
}

function bufferToBitBuffer(inputBuffer: Buffer): Buffer {
	const outputBuffer = Buffer.alloc(Math.ceil(inputBuffer.length / 8));
	let currentByte = 0;
	let bitPosition = 0;

	for (let i = 0; i < inputBuffer.length; i++) {
		const byte = inputBuffer[i];
		if (byte === 0x00) {
			currentByte = currentByte << 1;
		} else if (byte === 0xff) {
			currentByte = (currentByte << 1) | 1;
		} else {
			throw new Error(`Invalid byte at position ${i}: 0x${byte.toString(16)}`);
		}
		bitPosition++;

		if (bitPosition === 8) {
			outputBuffer[Math.floor(i / 8)] = currentByte;
			currentByte = 0;
			bitPosition = 0;
		}
	}

	if (bitPosition !== 0) {
		currentByte <<= 8 - bitPosition;
		outputBuffer[Math.floor(inputBuffer.length / 8)] = currentByte;
	}

	return outputBuffer;
}

type Dimensions = {
	width: number;
	height: number;
};

function calculateRotation(imageSize: Dimensions, pageSize: Dimensions): number {
	const imageAspectRatio = imageSize.width / imageSize.height;
	const pageAspectRatio = pageSize.width / pageSize.height;

	const imageIsLandscape = imageAspectRatio > 1;
	const pageIsLandscape = pageAspectRatio > 1;

	// Rotate 90 degrees if the orientations are different
	return imageIsLandscape !== pageIsLandscape ? 90 : 0;
}

function isDecimal(num: number) {
	return num % 1 !== 0;
}

function getPadding(width: number, divider: number) {
	if (isDecimal(width / divider)) {
		return (Math.ceil(width / divider) - width / divider) * divider;
	}

	return 0;
}
