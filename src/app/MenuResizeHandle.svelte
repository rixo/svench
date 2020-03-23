<script>
  export let width

  let dragStart = null

  const mousedown = ({ pageX: x }) => {
    dragStart = { width, x }
    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)
  }

  const mousemove = ({ pageX: x }) => {
    requestAnimationFrame(() => {
      width = dragStart.width + x - dragStart.x
    })
  }

  const mouseup = () => {
    document.removeEventListener('mouseup', mouseup)
    document.removeEventListener('mousemove', mousemove)
    dragStart = null
  }
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
