<script>
  export let code
  export let language = 'svelte'

  const Prism = window.Prism

  let el

  $: if (Prism && el && code && language) {
    Prism.highlightElement(el)
  }
</script>

{#key code}
  <div>
    <pre class="prism">
      <code bind:this={el} class="language-{language}">{code}</code>
    </pre>
  </div>
{/key}

<style>
  pre.prism {
    margin: 0;
    padding: 0.5em;
    min-height: 100%;
    box-sizing: border-box;
  }
</style>
