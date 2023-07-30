<script lang="ts">
	import type { Variables } from '$lib/types';

	export let variableNames: string[];
	export let variables: Variables;
</script>

{#each variableNames as variableName}
	<label class="label">
		<span>{variableName}</span>
		<input
			bind:value={variables[variableName]}
			on:input
			class="input"
			type="text"
			placeholder={variableName}
		/>
	</label>
{/each}
