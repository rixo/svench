<script>
  '@!hmr'

  import { onMount, onDestroy } from 'svelte'
  import { getContext, updateContext } from './util.js'
  import Offscreen from './Offscreen.svelte'
  import Shadow from './Shadow.svelte'

  let providedName = null
  export { providedName as name }

  export let init = null
  export let hide = false
  export let jailbreak = false

  const {
    raw,
    naked,
    register,
    options,
    router,
    route,
    makeNamer,
    view,
    focus,
    extras,
    component: Cmp,
    getViewName,
    emitView,
    getUi,
  } = getContext()

  const { ViewBox, css } = getUi ? getUi() : {}

  const routeExtra = route.extra

  const name = getViewName(providedName, onDestroy)

  export let source = $routeExtra.sources[name]

  if (register) {
    register(name)
  }

  const hasView = view != null

  const rendering = hasView || jailbreak

  const isActive = !register && ((!hasView && !hide) || view === name)

  const willRender = isActive && rendering

  const href = router.resolve(`${route.path}?view=${name}`)

  let el

  if (!rendering) {
    updateContext({ view: name, getViewName: makeNamer() })
  }

  // --- focused view ---

  if (extras && focus && isActive) {
    $extras = {
      source,
    }
  }

  // --- offscreen ---

  // NOTE we defer creating the actual View's content (slot) because we don't
  // want user's onMount callbacks firing from outside the document's DOM
  let onScreen = false

  if (isActive && hasView && !raw) {
    onMount(() => {
      emitView(el, () => {
        onScreen = true
      })
    })
  } else {
    onScreen = true
  }

  // --- init ---

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

  $: props = { focus, options: $options, name, href, source, error }
</script>

{#if isActive}
  {#if raw}
    {#if rendering}
      {#if naked}
        {#if resolved}
          <slot />
        {/if}
      {:else}
        <ViewBox
          {router}
          {focus}
          options={$options}
          {name}
          {href}
          {source}
          {error}>
          {#if resolved}
            <slot />
          {/if}
        </ViewBox>
      {/if}
    {:else}
      <svelte:component this={Cmp} />
    {/if}
  {:else if rendering}
    <!-- WARNING if we bind el to an element inside viewbox, view won't be
         reemitted on HMR (hence stay "offscreen") -->
    <!-- /!\ NEEDED FOR HMR -->
    <svench:view bind:this={el} {name}>
      {#if naked}
        {#if resolved && onScreen}
          <slot />
        {/if}
      {:else if $options.shadow && !focus}
        <Shadow {router} {css} Component={ViewBox} {props}>
          <slot />
        </Shadow>
      {:else}
        <ViewBox {router} {...props}>
          {#if resolved && onScreen}
            <slot />
          {/if}
        </ViewBox>
      {/if}
    </svench:view>
  {:else}
    <Offscreen Component={Cmp} />
  {/if}
{/if}

<style>
  * {
    display: inherit;
    flex: inherit;
    flex-direction: inherit;
    float: inherit;
  }
</style>
