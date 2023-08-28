import { convertPdfToImage } from './pdf';
import { identify, imageMagick } from './imageMagick';
import { dpmmToDpi } from '../dpiUtils';
import { dev } from '$app/environment';
import { mkdirIfNotExists, writeDataFile } from './fileUtil';

export async function imageToZpl(input: Buffer, width: number, height: number, dpmm: number) {
	const metadata = await identify(input);
	let imageDimensions: Dimensions = {
		width: metadata.size.width ?? 1,
		height: metadata.size.height ?? 1
	};

	const printDimensions: Dimensions = {
		width: width + calculateAlignmentPadding(width, 8),
		height
	};

	const rotation = determineImageRotation(imageDimensions, printDimensions);
	imageDimensions = calculateRotatedDimensions(imageDimensions, rotation);
	const scale = computeOptimalScalingFactor(imageDimensions, printDimensions);
	imageDimensions = resizeDimensionsByScale(imageDimensions, scale);

	const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
		transformImageForPrinting(input, rotation, dpmm, imageDimensions, printDimensions)
			.setFormat('rgb')
			.toBuffer((err, buffer) => {
				if (err) {
					reject(err);
				} else {
					resolve(buffer);
				}
			});
	});

	if (dev) {
		const debugImageBuffer = await new Promise<Buffer>((resolve, reject) => {
			transformImageForPrinting(input, rotation, dpmm, imageDimensions, printDimensions)
				.setFormat('png')
				.toBuffer((err, buffer) => {
					if (err) {
						reject(err);
					} else {
						resolve(buffer);
					}
				});
		});

		transformImageForPrinting(input, rotation, dpmm, imageDimensions, printDimensions).stream(
			(_, __, ___, cmd) => console.debug(cmd)
		);

		await mkdirIfNotExists('debug');

		const filename = Date.now();
		await writeDataFile(`debug/${filename}.png`, debugImageBuffer);
	}

	const redBuffer = Buffer.alloc(imageBuffer.length / 3);

	// Iterate through the buffer, pulling out only the Red values.
	for (let i = 0, j = 0; i < imageBuffer.length; i += 3, j++) {
		redBuffer[j] = imageBuffer[i];
	}

	const monochromeBuffer = convertToMonochromeBitBuffer(redBuffer);

	const totalBytes = monochromeBuffer.byteLength;
	const hexString = monochromeBuffer.toString('hex');

	return `^XA^FO0,0^GFA,${totalBytes},${totalBytes},${Math.ceil(
		printDimensions.width / 8
	)},${hexString}^XZ`;
}

export async function pdfToImage(buffer: Buffer | ArrayBuffer) {
	const pdfDataBuffer = Buffer.from(buffer);
	const image = await convertPdfToImage(pdfDataBuffer, 1);

	return image;
}

function transformImageForPrinting(
	input: Buffer,
	rotation: number,
	dpmm: number,
	imageDimensions: Dimensions,
	printDimensions: Dimensions
) {
	return imageMagick(input)
		.rotate('#ffffff', rotation)
		.transparent('#ffffff')
		.density(dpmmToDpi(dpmm), dpmmToDpi(dpmm))
		.resize(imageDimensions.width, imageDimensions.height, '!')
		.gravity('Center')
		.extent(printDimensions.width, printDimensions.height)
		.negative()
		.threshold(50, true)
		.bitdepth(8);
}

function convertToMonochromeBitBuffer(inputBuffer: Buffer): Buffer {
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

function determineImageRotation(imageSize: Dimensions, pageSize: Dimensions): number {
	const imageAspectRatio = imageSize.width / imageSize.height;
	const pageAspectRatio = pageSize.width / pageSize.height;

	const imageIsLandscape = imageAspectRatio > 1;
	const pageIsLandscape = pageAspectRatio > 1;

	// Rotate 90 degrees if the orientations are different
	return imageIsLandscape !== pageIsLandscape ? 90 : 0;
}

function computeOptimalScalingFactor(dimensionsA: Dimensions, dimensionsB: Dimensions): number {
	const widthRatio = dimensionsB.width / dimensionsA.width;
	const heightRatio = dimensionsB.height / dimensionsA.height;

	return Math.min(widthRatio, heightRatio);
}

function calculateRotatedDimensions(dimensions: Dimensions, rotation: number): Dimensions {
	if (rotation % 180 === 0) {
		return dimensions;
	}

	return {
		width: dimensions.height,
		height: dimensions.width
	};
}

function resizeDimensionsByScale(dimensions: Dimensions, scale: number): Dimensions {
	return {
		width: dimensions.width * scale,
		height: dimensions.height * scale
	};
}

function isDecimal(num: number) {
	return num % 1 !== 0;
}

function calculateAlignmentPadding(width: number, divider: number) {
	if (isDecimal(width / divider)) {
		return (Math.ceil(width / divider) - width / divider) * divider;
	}

	return 0;
}
