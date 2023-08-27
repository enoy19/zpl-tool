import { getDataFilePathFor, mkdirIfNotExists } from '$lib/server/fileUtil';
import type { PrinterConfig } from '$lib/types';
import { writeFile } from 'fs/promises';
import { Printer } from './printer';

export class DebugPrinter extends Printer {
	constructor(identifier: string, private readonly config: PrinterConfig<'debug'>) {
		super(identifier);
	}

	public async print(zpl: string): Promise<void> {
		console.debug(`ZPL:\n\n ${zpl}`);

		await mkdirIfNotExists('debug');

		const filename = Date.now();
		const zplPath = getDataFilePathFor(`debug/${filename}.zpl`);
		await writeFile(zplPath, zpl);

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}
