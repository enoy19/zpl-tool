<script lang="ts">
	export let options: Record<string, unknown>;
</script>

<label for="host" class="label">
	<span>Host</span>
	<input
		class="input"
		type="text"
		name="host"
		id="host"
		value={options.host}
		placeholder="localhost"
	/>
</label>
<label for="port" class="label">
	<span>Port</span>
	<input
		class="select"
		type="number"
		min="0"
		max="65535"
		name="port"
		id="port"
		value={options.port}
	/>
</label>
