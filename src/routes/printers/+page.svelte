<script lang="ts">
	import PrinterConfigBase from '$lib/components/printer/PrinterConfig.svelte';
	import SerialPrinterOptions from '$lib/components/printer/SerialPrinterOptions.svelte';
	import TcpPrinterOptions from '$lib/components/printer/TcpPrinterOptions.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ printerConfigs } = data);
	$: printerIdentifiers = Object.keys(printerConfigs);
</script>

<div class="w-full flex justify-center">
	<div class="container mt-4 flex flex-col items-center gap-3 px-3">
		<h1 class="h1">Printers</h1>
		{#each printerIdentifiers as identifier, i (`${i}_${identifier}`)}
			{@const printerConfig = printerConfigs[identifier]}
			{@const { dpmm, widthMm, heightMm } = printerConfig}
			<PrinterConfigBase {identifier} type={printerConfig.type} {dpmm} {widthMm} {heightMm}>
				<svelte:fragment slot="options">
					{#if printerConfig.type === 'serial'}
						<SerialPrinterOptions options={printerConfig.options} />
					{:else if printerConfig.type === 'tcp'}
						<TcpPrinterOptions options={printerConfig.options} />
					{/if}
				</svelte:fragment>
			</PrinterConfigBase>
		{/each}
		<hr class="my-4 w-full" />
		<h1 class="h1">New Printer</h1>
		<PrinterConfigBase
			identifier="New Serial Printer"
			type="serial"
			dpmm={0}
			heightMm={0}
			widthMm={0}
			deleteHidden
		>
			<SerialPrinterOptions
				slot="options"
				options={{
					path: '/dev/path/to/device',
					baudRate: 9600
				}}
			/>
		</PrinterConfigBase>

		<PrinterConfigBase
			identifier="New TCP Printer"
			type="tcp"
			dpmm={0}
			heightMm={0}
			widthMm={0}
			deleteHidden
		>
			<TcpPrinterOptions
				slot="options"
				options={{
					host: 'localhost',
					port: 9100
				}}
			/>
		</PrinterConfigBase>
	</div>
</div>
