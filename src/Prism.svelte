<script>
  import { slide } from 'svelte/transition'

  export let code
  export let language = 'svelte'
  export let anim = true

  const Prism = window.Prism

  let el

  $: if (Prism && el && code && language) {
    Prism.highlightElement(el)
  }
</script>

{#if anim}
  <pre class="prism" transition:slide={{ duration: 200 }}>
    <code bind:this={el} class="language-{language}">{code}</code>
  </pre>
{:else}
  <pre class="prism">
    <code bind:this={el} class="language-{language}">{code}</code>
  </pre>
{/if}

<style>
  pre.prism {
    margin: 0;
    padding: 0.5rem;
  }
</style>
