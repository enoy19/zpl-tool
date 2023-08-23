<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-rocket.css';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';

	import { AppShell, Modal, Toast } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<Toast position="br" />
<Modal />

<div class="mb-32">
	<AppShell>
		<AppBar slot="header">
			<a href="/">zpl-tool</a>
			<svelte:fragment slot="trail">
				<a href="/printers">Printers</a>
				<a href="/pdf">Print PDF</a>
			</svelte:fragment>
		</AppBar>
		<slot name="pageHeader" slot="pageHeader" />

		<slot name="sidebarLeft" slot="sidebarLeft" />

		<slot />

		<slot name="sidebarRight" slot="sidebarRight" />

		<slot name="pageFooter" slot="pageFooter" />
		<slot name="footer" slot="footer" />
	</AppShell>
</div>
