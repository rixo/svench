<script>
  export let onClick = () => {}

  const handleClick = () => {
    if (!onClick) return
    onClick({ payload: 'blah blah' })
  }
</script>

<button on:click on:click={handleClick}>Click! Click!</button>
