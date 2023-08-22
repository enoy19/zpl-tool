import { persisted } from 'svelte-local-storage-store';

export const autoRenderPreview = persisted<boolean>('autoRenderPreview', true);
