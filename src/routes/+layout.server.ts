import { templates } from '$lib/server/templates';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		templates
	};
};
