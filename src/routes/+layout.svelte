<script lang="ts">
import '../app.css';
import { onMount } from 'svelte';
import { lang } from '$lib/stores/lang';
import Footer from '$lib/components/Footer.svelte';

let { children } = $props();

onMount(() => {
  lang.init();
});
</script>

<div class="app">
  {@render children()}
  <Footer />
</div>
