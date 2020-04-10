<script>
  import { slide } from 'svelte/transition'
  import Prism from './Prism.vendor.js'

  export let code
  export let language = 'svelte'

  let el

  $: if (el && code && language) {
    Prism.highlightElement(el)
  }
</script>

<div transition:slide|local={{ duration: 150 }}>
  <pre class="prism">
    <code bind:this={el} class="language-{language}">{code}</code>
  </pre>
</div>

<style>
  pre.prism {
    margin: 0;
    padding: 0.5rem;
  }
</style>
