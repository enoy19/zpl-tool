<script lang="ts">
	import { baudRates } from '$lib/constants';
	export let options: Record<string, unknown>;
</script>

<label for="path" class="label">
	<span>Path</span>
	<input class="input" type="text" name="path" id="path" value={options.path} />
</label>
<label for="baudRate" class="label">
	<span>Baud rate</span>
	<select class="select" name="baudRate" id="baudRate" value={options.baudRate}>
		{#each baudRates as baudRate}
			<option value={baudRate}>{baudRate}</option>
		{/each}
	</select>
</label>
