import { persisted } from 'svelte-local-storage-store';
import type { PreviewGeneratorType } from './preview';

export const autoRenderPreview = persisted<boolean>('autoRenderPreview', true);
export const previewGenerator = persisted<PreviewGeneratorType>('previewGenerator', 'labelary');
