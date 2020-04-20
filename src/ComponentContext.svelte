<script>
  import { getContext, updateContext } from './util.js'
  import Offscreen from './Offscreen.svelte'
  import ApplyPrism from './ApplyPrism.svelte'

  export let route
  export let component
  export let view

  export let focused = view !== null

  const { raw, makeNamer } = getContext()

  updateContext({
    route,
    focused,
    view,
    component,
    makeNamer,
    getViewName: makeNamer(),
  })
</script>

<ApplyPrism>
  {#if raw}
    <svelte:component this={component} />
  {:else if view}
    <Offscreen Component={component} />
  {:else}
    <svelte:component this={component} />
  {/if}
</ApplyPrism>
