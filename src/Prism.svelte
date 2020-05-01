<script>
  import { slide } from 'svelte/transition'

  export let code
  export let language = 'svelte'

  const Prism = window.Prism

  let el

  $: if (Prism && el && code && language) {
    Prism.highlightElement(el)
  }
</script>

<pre class="prism" transition:slide|local={{ duration: 200 }}>
  <code bind:this={el} class="language-{language}">{code}</code>
</pre>

<style>
  pre.prism {
    margin: 0;
    padding: 0.5rem;
  }
</style>
