<script>
  import { onMount } from 'svelte'
  import { updateContext } from './util.js'

  export let focus = false
  export let target = null

  let offscreen

  const update = async view => {
    if (!focus) return
    if (!offscreen) return
    const _target = target || offscreen.parentNode
    if (!_target) return
    _target.appendChild(view)
  }

  // onMount(() => {
  //   const parent = document.createElement('div')
  //   parent.appendChild(offscreen)
  // })

  updateContext({ emitViewBox: update })
</script>

{#if focus}
  <div bind:this={offscreen} class="offscreen">
    <slot />
  </div>
{:else}
  <slot />
{/if}

<style>
  .offscreen {
    display: none;
    border: 15px solid orange; /* NOTE you should never see that */
  }
</style>
