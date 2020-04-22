<script>
  import { onDestroy } from 'svelte'

  export let right = false
  export let top = false

  export let width

  let dragStart = null
  let raf = null

  $: prop = right ? 'pageX' : 'pageY'
  $: dir = right ? 1 : -1

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
      width = dragStart.width + dir * (x - dragStart.x)
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

<div class:right class:top on:mousedown={mousedown} />

<style>
  .right {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 5px;
    cursor: ew-resize;
    user-select: none;
  }

  .top {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 5px;
    cursor: ns-resize;
    user-select: none;
  }
</style>
