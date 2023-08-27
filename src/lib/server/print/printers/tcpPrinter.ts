import type { PrinterConfig } from '$lib/types';
import { Printer } from './printer';
import * as net from 'net';

export class TcpPrinter extends Printer {
	constructor(identifier: string, private readonly config: PrinterConfig<'tcp'>) {
		super(identifier);
	}

	public async print(zpl: string): Promise<void> {
		const client = new net.Socket();

		await new Promise((resolve, reject) => {
			client.connect(this.config.options.port, this.config.options.host, () => {
				client.write(zpl, () => {
					client.end();
					resolve(undefined);
				});
			});

			client.on('error', (err) => {
				reject(err);
			});
		});
	}
}
