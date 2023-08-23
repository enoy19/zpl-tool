import pdf2pic from 'pdf2pic';
import { dpmmToDpi } from './dpiUtils';

type PdfConversionOptions = {
	/**
	 * Image compression level. Value depends on format, usually from 0 to 100 (more info)
	 * default: 0
	 */
	quality?: number;
	/**
	 * Formatted image characteristics / image format (image characteristics, image format)
	 * default: png
	 */
	format?: string;
	/**
	 * Output width
	 * default: 768
	 */
	width?: number;
	/**
	 * Output height
	 * default: 512
	 */
	height?: number;
	/**
	 * Output DPI (dots per inch)
	 * default: 72
	 */
	density?: number;
	/**
	 * Path where to save the output
	 * default: './'
	 */
	savePath?: string;
	/**
	 * Output filename
	 * default: 'untitled'
	 */
	saveFilename?: string;
	/**
	 * Compression method
	 * default: 'jpeg'
	 */
	compression?: string;
};

type ConvertResponseType = 'image' | 'base64' | 'buffer';

type ConvertOptions<T extends ConvertResponseType> = {
	/**
	 * Response type of the output. Accepts: image, base64 or buffer
	 * default: image
	 */
	responseType: T;
};

type ConvertResultPayload<T extends ConvertResponseType> = T extends 'buffer'
	? Buffer
	: T extends 'image'
	? Buffer
	: T extends 'base64'
	? string
	: never;

type ConvertResult<T extends ConvertResponseType> = {
	page: number;
	size: `${number}x${number}`;
} & {
	[key in T]: ConvertResultPayload<T>;
};

type Convert<T extends ConvertResponseType> = (
	pages: number | number[],
	options: ConvertOptions<T>
) => Promise<ConvertResult<T>>;

const fromBuffer = (buffer: Buffer, options: PdfConversionOptions): Convert<'buffer'> =>
	pdf2pic.fromBuffer(buffer, options);

export async function convertPdfToImage(
	buffer: Buffer,
	dpmm: number,
	width: number,
	height: number
) {
	return fromBuffer(buffer, {
		width,
		height,
		density: dpmmToDpi(dpmm)
	})(1, { responseType: 'buffer' });
}
