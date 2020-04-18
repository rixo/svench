<script>
  import { onMount, onDestroy } from 'svelte'
  import { getContext, updateContext } from './util.js'
  import Offscreen from './RenderOffscreen.svelte'
  import ViewBox from './app/ViewBox.svelte'

  let providedName = null
  export { providedName as name }

  export let init = null
  export let hide = false
  export let source = null
  export let jailbreak = false

  const {
    raw,
    register,
    options,
    router,
    route,
    makeNamer,
    view,
    focused,
    component: Cmp,
    getViewName,
    emitViewBox,
  } = getContext()

  const name = getViewName(providedName, onDestroy)

  if (register) {
    register(name)
  }

  const renderPhase = view != null

  const isActive = !register && ((view == null && !hide) || view === name)

  const willRender = (isActive && renderPhase) || jailbreak

  const href = router.resolve(`${route.path}?view=${name}`)

  let el

  if (!renderPhase) {
    updateContext({ view: name, getViewName: makeNamer() })
  }

  if (isActive && renderPhase && !raw) {
    onMount(() => {
      emitViewBox(el)
    })
  }

  // init
  let resolved = false
  let error = null
  {
    const prepare = async () => {
      try {
        // if (mainInit) await mainInit()
        if (init) await init()
        resolved = true
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        error = err
      }
    }
    if (willRender) {
      prepare()
    }
  }
</script>

{#if isActive}
  {#if renderPhase || jailbreak}
    {#if focused && raw}
      {#if resolved}
        <slot />
      {/if}
    {:else}
      <!-- WARNING if we bind el to an element inside viewbox, view won't be
           reemitted on HMR (hence stay "offscreen") -->
      <!-- /!\ NEEDED FOR HMR -->
      <div bind:this={el} class="svench-view-target">
        <ViewBox
          ui={!focused}
          options={$options}
          {name}
          {href}
          {source}
          {error}>
          {#if resolved}
            <slot />
          {/if}
        </ViewBox>
      </div>
    {/if}
  {:else}
    <Offscreen>
      <Cmp />
    </Offscreen>
  {/if}
{/if}

<style>
  div {
    flex: inherit;
    display: inherit;
    flex-direction: inherit;
  }
</style>
