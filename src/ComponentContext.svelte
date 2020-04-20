<script>
  import { getContext, updateContext } from './util.js'
  import Offscreen from './Offscreen.svelte'
  import PrismApply from './PrismApply.svelte'

  export let route
  export let component
  export let view

  export let focus = view !== null

  const { raw, makeNamer } = getContext()

  updateContext({
    route,
    focus,
    view,
    component,
    makeNamer,
    getViewName: makeNamer(),
  })
</script>

<PrismApply>
  {#if raw}
    <svelte:component this={component} />
  {:else if view}
    <Offscreen Component={component} />
  {:else}
    <svelte:component this={component} />
  {/if}
</PrismApply>
