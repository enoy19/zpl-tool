import { mkdirIfNotExists, writeDataFile } from '$lib/server/fileUtil';
import type { PrinterConfig } from '$lib/types';
import { Printer } from './printer';

export class DebugPrinter extends Printer {
	constructor(identifier: string, private readonly config: PrinterConfig<'debug'>) {
		super(identifier);
	}

	public async print(zpl: string): Promise<void> {
		await mkdirIfNotExists('debug');

		const filename = Date.now();
		await writeDataFile(`debug/${filename}.zpl`, zpl);

		await new Promise((resolve) => setTimeout(resolve, 500));
	}
}
