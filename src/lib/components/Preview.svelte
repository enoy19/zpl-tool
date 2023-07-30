<script lang="ts">
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import { fade } from "svelte/transition";

    export let renderPromise: Promise<string>;
</script>

{#await renderPromise}
	<div class="w-full flex justify-center">
		<ProgressRadial
			width="w-[4rem]"
			stroke={100}
			meter="stroke-primary-500"
			track="stroke-primary-500/30"
		/>
	</div>
{:then base64Img}
	<img src={`data:image/png;base64, ${base64Img}`} alt="ZPL" />
{:catch e}
	<aside transition:fade={{ duration: 200 }} class="alert variant-ghost-error">
		<div class="alert-message">
			<h3 class="h3">Error</h3>
			<p>Could not render ZPL: ${e}</p>
		</div>
	</aside>
{/await}
