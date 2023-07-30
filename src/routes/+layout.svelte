<script lang='ts'>
	import '@skeletonlabs/skeleton/themes/theme-rocket.css';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';

	import { AppShell } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<div class="mb-32">
	<AppShell>
		<AppBar slot="header"><a href="/">ZPL-Tool</a></AppBar>
		<slot name="pageHeader" slot="pageHeader"/>
		
		<slot name="sidebarLeft" slot="sidebarLeft" />
		
		<slot />
		
		<slot name="sidebarRight" slot="sidebarRight"/>
	
		<slot name="pageFooter" slot="pageFooter" />
		<slot name="footer" slot="footer" />
	</AppShell>
</div>
