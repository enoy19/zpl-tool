<script lang="ts">
	import { autoRenderPreview } from '$lib/stores';
	import { SlideToggle } from '@skeletonlabs/skeleton';
</script>

<div class="flex flex-row gap-3 items-center">
	<button type="button" class="btn variant-filled-primary btn-sm" on:click>Render</button>
	<SlideToggle
		size="sm"
		active="bg-primary-500"
		name="autoRenderPreview"
		bind:checked={$autoRenderPreview}>Auto Render</SlideToggle
	>
</div>
