import type { PrinterConfig, PrinterConfigs, PrinterOptions, PrinterType } from '$lib/types';
import { createEmptyJsonFileIfNotExists, readJson, storeObject } from '../../fileUtil';
import type { Printer } from './printer';
import { SerialPrinter } from './serialPrinter';
import { TcpPrinter } from './tcpPrinter';

const printersFilename = 'printerConfigs.json';
export const printers: Printer[] = [];

await createEmptyJsonFileIfNotExists(printersFilename);

export const printerConfigs: PrinterConfigs = await readJson(printersFilename);
reloadPrinters();

export function reloadPrinters() {
	printers.splice(0, printers.length);
	for (const identifier in printerConfigs) {
		const printer = printerFromConfig(identifier, printerConfigs[identifier]);
		printers.push(printer);
	}
}

export async function savePrinter<T extends PrinterType>(
	identifier: string,
	newIdentifier: string,
	dpmm: number,
	widthMm: number,
	heightMm: number,
	type: T,
	options: PrinterOptions<T>
) {
	delete printerConfigs[identifier];

	printerConfigs[newIdentifier] = {
		type,
		dpmm,
		widthMm,
		heightMm,
		options
	};

	await storeObject(printerConfigs, printersFilename);
	reloadPrinters();
}

export async function deletePrinter(identifier: string) {
	delete printerConfigs[identifier];

	await storeObject(printerConfigs, printersFilename);
	reloadPrinters();
}

function printerFromConfig<T extends PrinterType>(
	identifier: string,
	printerConfig: PrinterConfig<T>
) {
	switch (printerConfig.type) {
		case 'serial': {
			return new SerialPrinter(identifier, printerConfig.options as PrinterOptions<'serial'>);
		}
		case 'tcp': {
			return new TcpPrinter(identifier, printerConfig.options as PrinterOptions<'tcp'>);
		}
		default:
			throw new Error(`unknown printer type ${printerConfig.type}`);
	}
}
