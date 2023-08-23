import { PDFDocument } from 'pdf-lib';
import { convertPdfToImage } from './pdf';
import sharp from 'sharp';

export async function imageToZpl(buffer: Buffer, width: number, height: number, threshold = 50) {
	const image = sharp(buffer);
	const metadata = await image.metadata();
	const rotation = calculateRotation(
		{
			width: metadata.width ?? 1,
			height: metadata.height ?? 1
		},
		{
			width,
			height
		}
	);

	const paddedWidth = width + getPadding(width, 8);

	const sharpBuffer = await image
		.rotate(rotation)
		.negate()
		.threshold(threshold) // Convert to monochrome
		.resize(paddedWidth, height, {
			fit: 'fill'
		})
		.extractChannel(0)
		.raw()
		.toBuffer();

	const monochromeBuffer = bufferToBitBuffer(sharpBuffer);

	const totalBytes = monochromeBuffer.byteLength;
	const hexString = monochromeBuffer.toString('hex');

	return `^XA^FO0,0^GFA,${totalBytes},${totalBytes},${Math.ceil(paddedWidth / 8)},${hexString}^XZ`;
}

export async function pdfToImage(buffer: Buffer | ArrayBuffer, dpi = 300) {
	const pdfDataBuffer = Buffer.from(buffer);

	const pdfDoc = await PDFDocument.load(pdfDataBuffer);
	const page = pdfDoc.getPage(0);
	const { width: widthInPoints, height: heightInPoints } = page.getSize();
	const rotation = page.getRotation();

	const { width: widthInPointsRotated, height: heightInPointsRotated } = rotateDimension(
		{ width: widthInPoints, height: heightInPoints },
		rotation.type === 'degrees' ? rotation.angle : toDegree(rotation.angle)
	);

	const width = Math.round((widthInPointsRotated / 72) * dpi);
	const height = Math.round((heightInPointsRotated / 72) * dpi);

	const { buffer: image } = await convertPdfToImage(pdfDataBuffer, 10, width, height);

	return { image, width, height };
}

function rotateDimension({ width, height }: Dimensions, rotationDegrees: number) {
	if (rotationDegrees % 180 !== 0) {
		return {
			width: height,
			height: width
		};
	}

	return {
		width,
		height
	};
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

function toDegree(radian: number) {
	return (radian * 180) / Math.PI;
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
