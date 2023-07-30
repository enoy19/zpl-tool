import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SerialPort } from 'serialport';

export const actions: Actions = {
	async print({ request }) {
		const formData = await request.formData();

		const zpl = formData.get('zpl')?.valueOf();

		if (!zpl || typeof zpl !== 'string') {
			return fail(400);
		}

		const port = new SerialPort({
			path: '/dev/rfcomm0',
			baudRate: 9600 // TODO: adjust if needed
		});

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

		return;
	}
};
