export function dpmmToDpi(dpmm: number): number {
	const mmPerInch = 25.4;
	const dpi = dpmm * mmPerInch;
	return Math.round(dpi);
}

export function mmToPixels(dpmm: number, widthMm: number, heightMm: number) {
	const width = Math.round(dpmm * widthMm);
	const height = Math.round(dpmm * heightMm);
	return { width, height };
}
