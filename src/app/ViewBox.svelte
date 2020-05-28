<script>
  import Prism from '../Prism.svelte'

  // $: ({ name, source, href } = $$props)

  export let name
  export let source
  export let href

  // export let options
  // export let error

  let showSource = null

  const toggleSource = () => {
    showSource = !showSource
  }
</script>

<div class="svench-viewbox">
  <h3 class="svench-viewbox-title svench-ui">
    <div class="svench-viewbox-toolbar">
      {#if source}
        <button class="code" on:click={toggleSource}>{'</>'}</button>
      {/if}
    </div>
    <a {href}>
      <span class="icon">⟡</span>
      {name}
    </a>
  </h3>
  {#if showSource}
    <Prism code={source} />
  {/if}
  <slot />
</div>
