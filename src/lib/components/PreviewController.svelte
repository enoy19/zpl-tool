<script lang="ts">
	import { previewGeneratorTypes } from '$lib/preview';
	import { autoRenderPreview, previewGenerator } from '$lib/stores';
	import { SlideToggle } from '@skeletonlabs/skeleton';
</script>

<div class="flex flex-row gap-3 items-center">
	<select class="select w-min" bind:value={$previewGenerator}>
		{#each previewGeneratorTypes as previewGeneratorType}
			<option value={previewGeneratorType}>{previewGeneratorType}</option>
		{/each}
	</select>
	<button type="button" class="btn variant-filled-primary btn-sm" on:click>Render</button>
	<SlideToggle
		size="sm"
		active="bg-primary-500"
		name="autoRenderPreview"
		bind:checked={$autoRenderPreview}>Auto Render</SlideToggle
	>
</div>
