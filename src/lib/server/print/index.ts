import { printers } from './printers';

export async function print(zpl: string, printerIdentifier: string) {
	const printer = printers.find((p) => p.identifier === printerIdentifier);

	if (!printer) {
		throw new Error(`printer ${printer} not found`);
	}

	await printer.print(zpl);
}
