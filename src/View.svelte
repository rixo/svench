<script>
  '@!hmr'

  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'
  import { getContext, updateContext, noop } from './util.js'
  import Offscreen from './Offscreen.svelte'
  import Shadow from './Shadow.svelte'
  import Knobs from './knobs.js'
  import ViewCanvas from './ViewCanvas.svelte'

  let providedName = null
  export { providedName as name }

  export let init = null
  export let hide = false
  export let jailbreak = false

  export let fill = false

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
    emitViewSlot,
    nextSlotId,
    componentContextId,
  } = getContext()

  // NOTE getUi is not defined in register
  const { shadow, css, ViewBox } = getUi ? getUi() : {}

  const slotId = emitViewSlot && nextSlotId()

  const name = getViewName(providedName, onDestroy)

  export let source

  let knobsConfig = null
  export { knobsConfig as knobs }

  export let actions = null

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

  let knobs
  let action = noop

  $: ({ actions: actionsStore } = $extras || {})

  if (isActive && rendering) {
    const previous =
      extras &&
      focus &&
      isActive &&
      $extras &&
      $extras.id === componentContextId &&
      $extras.knobs
    knobs = Knobs(knobsConfig, previous)
  }

  if (extras && focus && isActive) {
    $extras = {
      id: componentContextId,
      source,
      knobs,
      actions: writable({
        enabled: !!actions,
        events: [],
      }),
    }

    action = (event, ...args) => {
      const handler = (...args) => {
        $actionsStore.events.unshift({
          date: new Date(),
          event,
          data: args.shift(),
        })
        $actionsStore = $actionsStore
      }
      if (args.length > 0) {
        return handler(...args)
      } else {
        return handler
      }
    }
  }

  // --- offscreen ---

  // NOTE we defer creating the actual View's content (slot) because we don't
  // want user's onMount callbacks firing from outside the document's DOM
  let onScreen = false

  if (isActive && hasView && !raw) {
    // if (isActive && !raw && rendering && !naked) {
    onMount(() => {
      const afterEmit = () => {
        onScreen = true
      }
      if (emitViewSlot) {
        const slot = document.createElement('slot')
        slot.name = slotId
        emitViewSlot(slotId, el)
        emitView(slot, afterEmit)
      } else {
        emitView(el, afterEmit)
      }
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

  // $: props = { options: $options, name, href, source, error }
  $: props = { name, href, source }
  $: canvasProps = { error, options: $options, focus, fill }
</script>

{#if isActive}
  {#if raw}
    {#if rendering}
      {#if resolved}
        <slot knobs={$knobs || {}} {action} />
      {/if}
      <!-- {#if naked}
        {#if resolved}
          <slot knobs={$knobs || {}} {action} />
        {/if}
      {:else}
        <ViewBox {...props}>
          <ViewCanvas {...canvasProps}>
            {#if resolved}
              <slot knobs={$knobs || {}} {action} />
            {/if}
          </ViewCanvas>
        </ViewBox>
      {/if} -->
    {:else}
      <svelte:component this={Cmp} />
    {/if}
  {:else if rendering}
    <!-- WARNING if we bind el to an element inside viewbox, view won't be
         reemitted on HMR (hence stay "offscreen") -->
    <!-- /!\ NEEDED FOR HMR -->
    {#if emitViewSlot}
      {@html `<slot name="${slotId}"></slot>`}
    {/if}
    <svench-view bind:this={el} {name} {fill}>
      {#if naked}
        {#if resolved && onScreen}
          <slot knobs={$knobs || {}} {action} />
        {/if}
      {:else if shadow && !focus}
        <Shadow {router} {css} Component={ViewBox} {props}>
          <slot knobs={$knobs || {}} {action} />
        </Shadow>
      {:else if focus}
        <ViewCanvas {...canvasProps}>
          {#if resolved && onScreen}
            <slot knobs={$knobs || {}} {action} />
          {/if}
        </ViewCanvas>
      {:else}
        <ViewBox {...props}>
          <ViewCanvas {...canvasProps}>
            {#if resolved && onScreen}
              <slot knobs={$knobs || {}} {action} />
            {/if}
          </ViewCanvas>
        </ViewBox>
      {/if}
    </svench-view>
  {:else}
    <Offscreen Component={Cmp} />
  {/if}
{/if}

<style>
  svench-view {
    display: inherit;
    flex: inherit;
    flex-direction: inherit;
    float: inherit;
    /* all: inherit; */
  }
</style>
