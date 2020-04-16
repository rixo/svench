<script>
  import { slide } from 'svelte/transition'
  import Prism from 'prismjs'
  import 'prism-svelte'
  import 'prismjs/themes/prism.css'
  import 'prismjs/components/prism-markdown.js'
  import 'prismjs/plugins/toolbar/prism-toolbar.js'
  import 'prismjs/plugins/toolbar/prism-toolbar.css'
  import 'clipboard/dist/clipboard.js'
  import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js'

  export let code
  export let language = 'svelte'

  let el

  $: if (el && code && language) {
    Prism.highlightElement(el)
  }
</script>

<div transition:slide|local={{ duration: 200 }}>
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
