<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PrinterType } from '$lib/types';
	import { confirmed } from '$lib/use/buttonConfirmed';

	export let identifier: string;
	export let dpmm: number;
	export let widthMm: number;
	export let heightMm: number;
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
		<section class="flex flex-col p-4 gap-2">
			<label for="name" class="label mb-3">
				<span>Name</span>
				<input class="input" type="text" name="newIdentifier" id="name" value={identifier} />
			</label>
			<div class="card p-2">
				<section>
					<label for="dpmm" class="label mb-3">
						<span>DPMM</span>
						<input class="input" type="number" name="dpmm" id="dpmm" value={dpmm} />
					</label>
					<label for="widthMm" class="label mb-3">
						<span>Width (mm)</span>
						<input class="input" type="number" name="widthMm" id="widthMm" value={widthMm} />
					</label>
					<label for="heightMm" class="label mb-3">
						<span>Height (mm)</span>
						<input class="input" type="number" name="heightMm" id="heightMm" value={heightMm} />
					</label>
				</section>
			</div>
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
				<button
					formaction={formDeleteAction}
					class="btn variant-filled-error"
					use:confirmed={{
						title: 'Delete Printer',
						body: `Please confirm that you want to delete "${identifier}"`
					}}>Delete</button
				>
			{:else}
				<div />
			{/if}
		</footer>
	</form>
</div>
