import { modalStore } from '@skeletonlabs/skeleton';

type ButtonConfirmedOptions = {
	title?: string;
	body?: string;
};

export function confirmed(button: HTMLButtonElement, options?: ButtonConfirmedOptions) {
	let confirmed = false;

	const clickListener = (e: MouseEvent) => {
		if (!confirmed) {
			e.preventDefault();

			const { title, body } = options ?? {};

			modalStore.trigger({
				type: 'confirm',
				title,
				body,
				response(r) {
					if (r) {
						confirmed = true;
						button.click();
					}
				}
			});

			confirmed = false;
		}
	};
	button.addEventListener('click', clickListener);

	return {
		destroy() {
			button.removeEventListener('click', clickListener);
		}
	};
}
