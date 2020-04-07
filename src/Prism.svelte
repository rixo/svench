<script context="module">
  const addStylesheet = href => {
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = href
    document.head.appendChild(style)
  }
  addStylesheet('https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/themes/prism.min.css')
  addStylesheet('https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/plugins/toolbar/prism-toolbar.min.css')
</script>

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
    padding: .5rem;
  }
</style>
