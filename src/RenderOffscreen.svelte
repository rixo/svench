<script>
  import { updateContext } from './util.js'

  export let target = null

  let offscreen

  const update = async view => {
    const _target = target || offscreen.parentNode
    if (!_target) return
    _target.insertBefore(view, offscreen.nextSibling)
  }

  updateContext({ emitViewBox: update })
</script>

<div bind:this={offscreen} class="svench offscreen" id={$$props.id}>
  <slot />
</div>

<style>
  div {
    display: none;
    border: 15px solid orange; /* NOTE you should never see that */
  }
</style>
