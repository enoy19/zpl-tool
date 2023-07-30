<script lang="ts">
	import { getVariableNames, renderZplToPngBase64 } from '$lib/labelary';
	import { densities, type Density, type Variables } from '$lib/types';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { fade, slide } from 'svelte/transition';
	import { throttle } from 'throttle-debounce';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import VariableInputs from '$lib/components/VariableInputs.svelte';
	import Preview from '$lib/components/Preview.svelte';

	export let data: PageData;
	$: ({ templates } = data);
	$: templateNames = Object.keys(templates);

	let currentTemplate: string;
	let zpl: string;
	let renderPromise: Promise<string>;
	let variableNames: string[] = [];
	let variables: Variables = {};

	let width: number = 100;
	let height: number = 150;
	let density: Density = '8dpmm';

	const debouncedRender = throttle(1000, render, {
		noLeading: true
	});

	function dataChanged() {
		variableNames = getVariableNames(zpl);
		renderPromise = new Promise(() => null);

		if (zpl.trim()) {
			debouncedRender();
		}
	}

	function render() {
		renderPromise = renderZplToPngBase64(zpl, variables, '8dpmm', width, height);
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
</script>

<div class="container mx-auto flex justify-center items-center">
	<div class="flex flex-col md:flex-row w-full gap-3 mt-4 mx-2">
		<div class="w-full">
			<form
				method="post"
				action="?/saveTemplate"
				use:enhance={() => {
					return async ({ update }) => {
						update({ reset: false });
					};
				}}
			>
				<h2 class="h2 mb-4">ZPL</h2>
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
			<div class="card p-4 mt-6">
				<h3 class="h3 mb-2">Templates</h3>
				<div class="flex flex-col gap-2">
					{#each templateNames as templateName, i (`${i}_${templateName}`)}
						<div class="flex gap-1 w-full">
							<a href={`/${templateName}`} class="btn variant-ghost-tertiary">Print</a>
							<button
								class="btn variant-ghost-secondary w-full"
								on:click={() => loadTemplate(templateName)}>{templateName}</button
							>
							<form method="post" action="?/deleteTemplate" use:enhance>
								<input type="hidden" name="templateName" value={templateName} />
								<button type="submit" class="btn variant-ghost-error">Delete</button>
							</form>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="w-full">
			<h2 class="h2 mb-4">Preview</h2>
			<Preview {renderPromise}/>
		</div>
	</div>
</div>
