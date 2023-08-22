import { SerialPort } from 'serialport';
import { Printer } from './printer';
import { fileExists } from '../../fileUtil';
import type { PrinterOptions } from '$lib/types';

export class SerialPrinter extends Printer {
	constructor(identifier: string, private readonly options: PrinterOptions<'serial'>) {
		super(identifier);
	}

	/**
	 * @override
	 */
	public async print(zpl: string): Promise<void> {
		const path = this.options.path;
		if (!path || !(await fileExists(path))) {
			throw new Error(`${path} not found`);
		}

		const port = new SerialPort(this.options);

		try {
			await new Promise((resolve, reject) => {
				port.write(zpl, (err) => {
					if (err) {
						console.error('Error writing to port:', err);
						reject(err);
					} else {
						console.log('Message sent');
						resolve(undefined);
					}
				});
			});
		} finally {
			port.close();
		}
	}
}
