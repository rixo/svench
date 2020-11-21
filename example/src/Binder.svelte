<script>
  export let value = 0

  const handleClick = () => {
    value++
  }
</script>

<button on:click={handleClick}>Click</button>

<span>({value})</span>
