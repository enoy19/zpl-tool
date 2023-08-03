<script lang="ts">
	import { persisted } from 'svelte-local-storage-store';

	let selectedPrinter = persisted('selectedPrinter', undefined);

	export let printers: string[];
	export let buttonLabel: string = 'Print';
    export let buttonColor: string = 'variant-filled-primary';
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr] mt-3">
	<select class="select" name="printer" bind:value={$selectedPrinter} required>
		{#each printers as printer}
			<option value={printer}>{printer}</option>
		{/each}
	</select>
	<button type="submit" class="btn {buttonColor} w-full">{buttonLabel}</button>
</div>
