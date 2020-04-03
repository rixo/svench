<script>
  import { onDestroy } from 'svelte'

  export let width

  let dragStart = null
  let raf = null

  const mousedown = ({ pageX: x }) => {
    dragStart = { width, x }
    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)
  }

  const mousemove = ({ pageX: x }) => {
    if (raf !== null) return
    raf = requestAnimationFrame(() => {
      raf = null
      if (!dragStart) return
      width = dragStart.width + x - dragStart.x
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

<div on:mousedown={mousedown} />

<style>
  div {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 5px;
    cursor: ew-resize;
    user-select: none;
  }
</style>
