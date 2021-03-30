<script>
  export let value = 0

  export let bold = false
  export let color = 'red'

  export let onChange = null

  const setValue = x => {
    value = x
    if (onChange) onChange({ value })
  }

  const minus = () => setValue(--value)

  const plus = () => setValue(++value)
</script>

<div on:click>
  <span class:bold style="color: {color};">{value}</span>
  <div>
    <button on:click={minus}>-</button>
    <button on:click={plus}>+</button>
  </div>
</div>

<style>
  div {
    font-family: sans-serif;
    text-align: center;
    padding: 0.5em;
  }
  span {
    font-size: 2em;
  }
  .bold {
    font-weight: bold;
  }
  button {
    width: 2em;
    height: 2em;
  }
</style>
