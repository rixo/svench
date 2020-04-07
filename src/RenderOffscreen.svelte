<script>
  // TODO cleanup

  // import { onMount } from 'svelte'
  import { updateContext } from './util.js'

  export let focus = false
  export let target = null

  let offscreen

  // TODO probably should move Prism out of this component
  const prism = view => {
    if (typeof Prism === 'undefined') return
    // eslint-disable-next-line no-undef
    Prism.highlightAllUnder(view.closest('.svench.canvas'))
  }

  const update = async view => {
    prism(view)
    if (!focus) return
    if (!offscreen) return
    const _target = target || offscreen.parentNode
    if (!_target) return
    _target.appendChild(view)
  }

  updateContext({ emitViewBox: update })
</script>

{#if focus}
  <div bind:this={offscreen} class="svench offscreen" id={$$props.id}>
    <slot />
  </div>
{:else}
  <slot />
{/if}

<style>
  div {
    display: none;
    border: 15px solid orange; /* NOTE you should never see that */
  }
</style>
