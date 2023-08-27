<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { persisted } from 'svelte-local-storage-store';

	let selectedPrinter = persisted('selectedPrinter', undefined);

	export let printing = false;
	export let printers: string[];
	export let buttonLabel = 'Print';
	export let buttonColor = 'variant-filled-primary';
	export let progressRadialColor = 'fill-on-primary-token';
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr] mt-3">
	<select class="select" name="printer" bind:value={$selectedPrinter} required>
		{#each printers as printer}
			<option value={printer}>{printer}</option>
		{/each}
	</select>
	<button type="submit" class="btn {buttonColor} w-full" disabled={printing}>
		<span>{buttonLabel}</span>
		{#if printing}
			<ProgressRadial width="w-6" fill={progressRadialColor} />
		{/if}
	</button>
</div>
