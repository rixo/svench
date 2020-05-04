<script>
  import { getContext, updateContext } from './util.js'
  import Offscreen from './Offscreen.svelte'
  import Shadow from './Shadow.svelte'
  import PrismApply from './PrismApply.svelte'
  import ComponentWrap from './ComponentWrap.svelte'
  import ShadowContext from './ComponentShadowContext.svelte'

  export let route
  export let component = null
  export let view = null

  export let focus

  const { raw, makeNamer, getUi, router } = getContext()

  const { shadow, css } = getUi()

  updateContext({
    route,
    focus,
    view,
    component,
    makeNamer,
    getViewName: makeNamer(),
  })

  const isShadow = !raw && !view && shadow
  // const isShadow = false

  let host

  if (isShadow) {
    let lastSlotId = 0

    const nextSlotId = () => 'view-' + ++lastSlotId

    const emitViewSlot = (id, el) => {
      el.slot = id
      host.appendChild(el)
    }

    updateContext({
      nextSlotId,
      emitViewSlot,
    })
  }

  const context = getContext()
</script>

<PrismApply>
  <!-- NOTE slot is used for fallback component -->
  <slot>
    <ComponentWrap {raw}>
      {#if raw}
        <svelte:component this={component} />
      {:else if view}
        <Offscreen Component={component} />
      {:else if isShadow}
        <Shadow
          bind:host
          {css}
          {router}
          Component={ShadowContext}
          props={{ context, Component: component }} />
      {:else}
        <svelte:component this={component} />
      {/if}
    </ComponentWrap>
  </slot>
</PrismApply>
