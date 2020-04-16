<script>
  import { getContext, updateContext } from './util.js'
  import Offscreen from './RenderOffscreen.svelte'
  import ApplyPrism from './routify/ApplyPrism.svelte'

  export let route
  export let component
  export let view

  export let focus = view !== null

  const { raw, makeNamer } = getContext()

  updateContext({
    route,
    focused: focus,
    view,
    component,
    makeNamer,
    getViewName: makeNamer(),
  })
</script>

<ApplyPrism>
  {#if view}
    {#if raw}
      <svelte:component this={component} />
    {:else}
      <Offscreen>
        <svelte:component this={component} />
      </Offscreen>
    {/if}
  {:else}
    <svelte:component this={component} />
  {/if}
</ApplyPrism>
