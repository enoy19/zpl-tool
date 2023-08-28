<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Preview from '$lib/components/Preview.svelte';
	import PreviewController from '$lib/components/PreviewController.svelte';
	import PrintButton from '$lib/components/PrintButton.svelte';
	import VariableInputs from '$lib/components/VariableInputs.svelte';
	import { mmToPixels } from '$lib/dpiUtils';
	import { renderZplToPngBase64 } from '$lib/preview';
	import { getVariableNames, renderZpl } from '$lib/render';
	import { autoRenderPreview, previewGenerator } from '$lib/stores';
	import type { Variables } from '$lib/types';
	import { FileDropzone, toastStore } from '@skeletonlabs/skeleton';
	import type { ActionResult } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { throttle } from 'throttle-debounce';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ templates, printers } = data);
	$: template = templates[$page.params.templateName];
	$: variableNames = getVariableNames(template.zpl);
	$: csvHeaders = btoa(variableNames.map((v) => `"${v}"`).join(';') + '\n');

	let variables: Variables = {};
	let renderPromise: Promise<string>;
	let csvFiles: FileList;
	let printing = false;

	$: zpl = renderZpl(template.zpl, variables);
	$: dpmm = parseInt(template.density.split('dpmm')[0]);
	$: pixelSize = mmToPixels(dpmm, template.width, template.height);

	for (const [key, value] of $page.url.searchParams.entries()) {
		variables[key] = value;
	}

	const debouncedRender = throttle(1000, render, {
		noLeading: true
	});

	function render() {
		renderPromise = renderZplToPngBase64(
			$previewGenerator,
			template.zpl,
			variables,
			'8dpmm',
			template.width,
			template.height
		);
	}

	function handleFormResult(result: ActionResult) {
		if (result.type === 'failure') {
			toastStore.trigger({
				message: `[${result.status}] Print failed: ${result?.data?.message}`,
				autohide: true,
				background: 'variant-filled-error'
			});
		} else if (result.type === 'success') {
			toastStore.trigger({
				message: `Print successful`,
				autohide: true,
				background: 'variant-filled-success'
			});
		}
	}

	onMount(() => {
		if ($autoRenderPreview) {
			debouncedRender();
		}
	});
</script>

<div class="container mx-auto flex justify-center items-center">
	<div class="flex flex-col md:flex-row w-full gap-3 mt-4 mx-2">
		<div class="w-full">
			<h2 class="h2 mb-4">Variables</h2>
			<div class="card p-4 flex flex-col gap-2 mt-4">
				<h3 class="h3">Variables</h3>
				<VariableInputs
					{variableNames}
					bind:variables
					on:input={() => {
						if ($autoRenderPreview) {
							debouncedRender();
						}
					}}
				/>
			</div>
			<form
				class="mt-4"
				method="post"
				action="?/print"
				use:enhance={() => {
					printing = true;

					return async ({ update, result }) => {
						printing = false;

						update({ reset: false });
						handleFormResult(result);
					};
				}}
			>
				<input type="hidden" name="zpl" value={zpl} />
				<PrintButton {printers} {printing} />
			</form>
			<hr class="my-3" />
			<div class="mt-3">
				<h3 class="h3">Bulk</h3>
				<a
					class="btn btn-sm variant-filled-warning"
					href={`data:text/csv;base64,${csvHeaders}`}
					download={$page.params.templateName + '.csv'}>Download CSV Template</a
				>
				<p class="mt-4">Drop CSV</p>
				<small>Delimiter: Semicolon ( ; ) - Every Cell in double quotes ( " )</small>
				<form
					action="?/printBulk"
					method="post"
					enctype="multipart/form-data"
					use:enhance={() => {
						printing = true;

						return async ({ update, result }) => {
							printing = false;

							update({ reset: false });
							handleFormResult(result);
						};
					}}
				>
					<FileDropzone class="mb-6" name="csv" bind:files={csvFiles} accept=".csv" required />

					{#if csvFiles && csvFiles.length > 0}
						<div transition:slide>
							<span class="font-bold">{csvFiles.item(0)?.name}</span>
						</div>
					{/if}

					<PrintButton
						{printers}
						buttonLabel={`Print${
							csvFiles && csvFiles.length > 0 ? `: ${csvFiles.item(0)?.name}` : ''
						}`}
						buttonColor="variant-filled-warning"
						progressRadialColor="fill-on-warning-token"
						{printing}
					/>
				</form>
			</div>
		</div>
		<div class="w-full">
			<h2 class="h2 mb-4">Preview</h2>
			<div class="mb-3">
				<PreviewController on:click={render} />
			</div>
			<Preview widthPixel={pixelSize.width} heightPixel={pixelSize.height} {renderPromise} />
		</div>
	</div>
</div>
