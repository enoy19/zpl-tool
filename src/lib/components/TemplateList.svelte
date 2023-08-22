<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmed } from '$lib/use/buttonConfirmed';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		templateSelected: string;
	}>();

	export let templateNames: string[];
</script>

{#if templateNames.length <= 0}
	<span>No Templates yet, start by entering ZPL into the editor below and Save the Template</span>
{:else}
	{#each templateNames as templateName, i (`${i}_${templateName}`)}
		<div class="flex gap-1 w-full">
			<a href={`/p/${templateName}`} class="btn variant-ghost-tertiary">Print</a>
			<button
				class="btn variant-ghost-secondary w-full"
				on:click={() => dispatch('templateSelected', templateName)}>{templateName}</button
			>
			<form method="post" action="?/deleteTemplate" use:enhance>
				<input type="hidden" name="templateName" value={templateName} />
				<button
					type="submit"
					class="btn variant-soft-error"
					use:confirmed={{
						title: 'Delete Template',
						body: `Please confirm that you want to delete "${templateName}"`
					}}>Delete</button
				>
			</form>
		</div>
	{/each}
{/if}
