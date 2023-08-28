<script lang="ts">
	import { enhance } from '$app/forms';
	import Preview from '$lib/components/Preview.svelte';
	import VariableInputs from '$lib/components/VariableInputs.svelte';
	import { densities } from '$lib/constants';
	import { renderZplToPngBase64 } from '$lib/preview';
	import type { Density, Variables } from '$lib/types';
	import { slide } from 'svelte/transition';
	import { throttle } from 'throttle-debounce';
	import type { PageData } from './$types';
	import TemplateList from '$lib/components/TemplateList.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { toastStore } from '@skeletonlabs/skeleton';
	import { getVariableNames } from '$lib/render';
	import PreviewController from '$lib/components/PreviewController.svelte';
	import { autoRenderPreview, previewGenerator } from '$lib/stores';
	import { mmToPixels } from '$lib/dpiUtils';

	export let data: PageData;
	$: ({ templates } = data);
	$: templateNames = Object.keys(templates);

	let currentTemplate: string;
	let zpl: string;
	let renderPromise: Promise<string>;
	let variableNames: string[] = [];
	let variables: Variables = {};

	let width = 100;
	let height = 150;
	let density: Density = '8dpmm';

	$: dpmm = parseInt(density.split('dpmm')[0]);
	$: pixelSize = mmToPixels(dpmm, width, height);

	const debouncedRender = throttle(1000, render, {
		noLeading: true
	});

	function dataChanged() {
		variableNames = getVariableNames(zpl);

		if ($autoRenderPreview) {
			renderPromise = new Promise(() => null);
		}

		if (zpl.trim() && $autoRenderPreview) {
			debouncedRender();
		}
	}

	function render() {
		renderPromise = renderZplToPngBase64($previewGenerator, zpl, variables, '8dpmm', width, height);
	}

	function loadTemplate(templateName: string) {
		const template = templates[templateName];
		zpl = template.zpl;
		width = template.width;
		height = template.height;
		density = template.density;
		currentTemplate = templateName;
		dataChanged();
	}

	function handleFormResult(result: ActionResult) {
		if (result.type === 'failure') {
			toastStore.trigger({
				message: `[${result.status}] Template save failed: ${result?.data?.message}`,
				autohide: true,
				background: 'variant-filled-error'
			});
		} else if (result.type === 'success') {
			toastStore.trigger({
				message: `Template saved!`,
				autohide: true,
				background: 'variant-filled-success'
			});
		}
	}
</script>

<div class="container mx-auto flex justify-center items-center">
	<div class="flex flex-col md:flex-row w-full gap-3 mt-4 mx-2">
		<div class="w-full">
			<div class="card p-4 mb-6">
				<h3 class="h3 mb-2">Templates</h3>
				<div class="flex flex-col gap-2">
					<TemplateList {templateNames} on:templateSelected={(e) => loadTemplate(e.detail)} />
				</div>
			</div>
			<h2 class="h2 mb-4">Editor</h2>
			<form
				method="post"
				action="?/saveTemplate"
				use:enhance={() => {
					return async ({ update, result }) => {
						update({ reset: false });
						handleFormResult(result);
					};
				}}
			>
				<textarea
					bind:value={zpl}
					class="textarea"
					rows="8"
					placeholder="Enter ZPL."
					on:input={dataChanged}
					name="zpl"
				/>
				<div class="flex flex-row gap-2 mt-4 w-full">
					<label class="label w-full">
						<span>Density (DPMM)</span>
						<select name="density" class="select" bind:value={density} on:change={dataChanged}>
							{#each densities as density}
								<option value={`${density}dpmm`}>{density}dpmm</option>
							{/each}
						</select>
					</label>
					<label class="label w-full">
						<span>Width</span>
						<input
							bind:value={width}
							on:input={dataChanged}
							class="input"
							type="number"
							placeholder="Width"
							name="width"
						/>
					</label>
					<label class="label w-full">
						<span>Height</span>
						<input
							bind:value={height}
							on:input={dataChanged}
							class="input"
							type="number"
							placeholder="Height"
							name="height"
						/>
					</label>
				</div>
				<div class="flex flex-row items-end gap-2 mt-4">
					<label class="label w-full">
						<span>Template Name</span>
						<input
							class="input"
							bind:value={currentTemplate}
							type="text"
							placeholder="Template Name"
							name="templateName"
						/>
					</label>
					<button class="btn variant-filled-primary">Save Template</button>
				</div>
				{#if variableNames.length > 0}
					<div transition:slide class="card p-4 flex flex-col gap-2 mt-4">
						<h3 class="h3">Variables</h3>
						<VariableInputs {variableNames} bind:variables on:input={dataChanged} />
					</div>
				{/if}
			</form>
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
