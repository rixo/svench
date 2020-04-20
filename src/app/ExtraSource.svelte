<script>
  import Unique from 'svelte-key'

  export let code
  export let language = 'svelte'

  const Prism = window.Prism

  let el

  $: if (Prism && el && code && language) {
    Prism.highlightElement(el)
  }
</script>

<Unique key={code}>
  <div>
    <pre class="prism">
      <code bind:this={el} class="language-{language}">{code}</code>
    </pre>
  </div>
</Unique>

<style>
  pre.prism {
    margin: 0;
    padding: 0.5rem;
  }
</style>
