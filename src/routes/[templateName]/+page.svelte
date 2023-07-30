<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Preview from '$lib/components/Preview.svelte';
	import VariableInputs from '$lib/components/VariableInputs.svelte';
	import { getVariableNames, renderZpl, renderZplToPngBase64 } from '$lib/labelary';
	import type { Variables } from '$lib/types';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	import { throttle } from 'throttle-debounce';
	import { onMount } from 'svelte';
	import { FileDropzone } from '@skeletonlabs/skeleton';

	export let data: PageData;
	$: ({ templates } = data);
	$: template = templates[$page.params.templateName];
	$: variableNames = getVariableNames(template.zpl);

	let variables: Variables = {};
	let renderPromise: Promise<string>;
	let csvFiles: FileList;

	$: zpl = renderZpl(template.zpl, variables);

	for (const [key, value] of $page.url.searchParams.entries()) {
		variables[key] = value;
	}

	const debouncedRender = throttle(1000, render, {
		noLeading: true
	});

	function render() {
		renderPromise = renderZplToPngBase64(
			template.zpl,
			variables,
			'8dpmm',
			template.width,
			template.height
		);
	}

	onMount(() => debouncedRender());
</script>

<div class="container mx-auto flex justify-center items-center">
	<div class="flex flex-col md:flex-row w-full gap-3 mt-4 mx-2">
		<div class="w-full">
			<h2 class="h2 mb-4">Variables</h2>
			<div class="card p-4 flex flex-col gap-2 mt-4">
				<h3 class="h3">Variables</h3>
				<VariableInputs {variableNames} bind:variables on:input={debouncedRender} />
			</div>
			<form
				class="mt-4"
				method="post"
				action="?/print"
				use:enhance={() => {
					return async ({ update }) => {
						update({ reset: false });
					};
				}}
			>
				<input type="hidden" name="zpl" value={zpl} />
				<button type="submit" class="btn variant-filled-primary w-full">Print</button>
			</form>
			<hr class="my-3" />
			<div class="mt-3">
				<h3 class="h3">Bulk</h3>
				<p>Drop CSV</p>
				<form
					action="?/printBulk"
					method="post"
					enctype="multipart/form-data"
					use:enhance={() => {
						return async ({ update }) => {
							update({ reset: false });
						};
					}}
				>
					<FileDropzone name="csv" bind:files={csvFiles} accept=".csv" required />

					{#if csvFiles && csvFiles.length > 0}
						<div transition:slide>
							<span class="font-bold">{csvFiles.item(0)?.name}</span>
						</div>
					{/if}

					<button type="submit" class="btn variant-filled-warning w-full mt-3"
						>Print{csvFiles && csvFiles.length > 0 ? `: ${csvFiles.item(0)?.name}` : ''}</button
					>
				</form>
			</div>
		</div>
		<div class="w-full">
			<h2 class="h2 mb-4">Preview</h2>
			<Preview {renderPromise} />
		</div>
	</div>
</div>
