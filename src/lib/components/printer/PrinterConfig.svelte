<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PrinterType } from '$lib/types';
	import { confirmed } from '$lib/use/buttonConfirmed';

	export let identifier: string;
	export let type: PrinterType;
	export let formAction = '?/savePrinter';
	export let formDeleteAction = '?/deletePrinter';

	export let deleteHidden = false;
</script>

<div class="card w-full">
	<form
		method="post"
		action={formAction}
		use:enhance={() => {
			return ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="identifier" value={identifier} />
		<input type="hidden" name="type" value={type} />
		<header class="card-header flex flex-row justify-between items-center">
			<h2 class="h2">{identifier}</h2>
			<span class="badge variant-filled">{type}</span>
		</header>
		<section class="p-4">
			<label for="name" class="label mb-3">
				<span>Name</span>
				<input class="input" type="text" name="newIdentifier" id="name" value={identifier} />
			</label>
			<div class="card p-2">
				<header>
					<h2>Options</h2>
				</header>
				<section>
					<slot name="options" />
				</section>
			</div>
		</section>
		<footer class="card-footer flex flex-row-reverse justify-between">
			<button type="submit" class="btn variant-filled-primary">Save</button>
			{#if !deleteHidden}
				<button formaction={formDeleteAction} class="btn variant-filled-error" use:confirmed={{
					title: 'Delete Printer',
					body: `Please confirm that you want to delete "${identifier}"`
				}}>Delete</button>
			{:else}
				<div />
			{/if}
		</footer>
	</form>
</div>
