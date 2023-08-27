<script lang="ts">
	import PrintButton from '$lib/components/PrintButton.svelte';
	import { FileDropzone, toastStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import type { ActionResult } from '@sveltejs/kit';

	export let data: PageData;
	$: ({ printers } = data);

	let pdfFiles: FileList;
	let printing = false;

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
</script>

<div class="container mx-auto flex justify-center items-center">
	<div class="w-full md:w-1/2 mx-2">
		<h1 class="h1 mt-4">Print PDF</h1>
		<form
			class="mt-4"
			method="post"
			enctype="multipart/form-data"
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
			<FileDropzone
				class="mb-4"
				name="pdfFiles"
				bind:files={pdfFiles}
				accept=".pdf"
				required
				multiple
			/>

			{#if pdfFiles && pdfFiles.length > 0}
				<div class="card p-4 max-h-64 overflow-y-auto">
					<ul transition:slide class="list">
						{#each pdfFiles as pdfFile}
							<li class="font-bold">
								<span class="flex-auto">{pdfFile?.name}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			<PrintButton {printers} {printing} />
		</form>
	</div>
</div>
