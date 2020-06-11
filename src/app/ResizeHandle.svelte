<script>
  import { onDestroy } from 'svelte'

  export let right = false
  export let left = false
  export let top = false
  export let bottom = false
  export let shrink = false

  export let width

  const min = 0

  let dragStart = null
  let raf = null

  $: h = left || right
  $: v = top || bottom

  $: prop = h ? 'pageX' : 'pageY'
  $: dir = shrink ? -1 : 1

  const mousedown = ({ [prop]: x }) => {
    dragStart = { width, x }
    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)
  }

  const mousemove = ({ [prop]: x }) => {
    if (raf !== null) return
    raf = requestAnimationFrame(() => {
      raf = null
      if (!dragStart) return
      width = Math.max(min, dragStart.width + dir * (x - dragStart.x))
    })
  }

  const mouseup = () => {
    document.removeEventListener('mouseup', mouseup)
    document.removeEventListener('mousemove', mousemove)
    dragStart = null
  }

  onDestroy(() => {
    if (raf !== null) {
      cancelAnimationFrame(raf)
    }
  })
</script>

<div
  class:h
  class:v
  class:right
  class:left
  class:top
  class:bottom
  on:mousedown={mousedown} />

<style>
  div {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    user-select: none;
    /* background-color: red; */
    z-index: 99;
  }

  .h {
    width: 5px;
    cursor: ew-resize;
  }
  .v {
    height: 5px;
    cursor: ns-resize;
  }

  .left {
    left: -5px;
    right: auto;
  }
  .right {
    left: auto;
  }
  .top {
    bottom: auto;
  }
  .bottom {
    bottom: auto;
  }
</style>
