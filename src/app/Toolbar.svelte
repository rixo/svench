<script>
  import { getContext } from '../util.js'

  const { options } = getContext()
</script>

<div class="wrapper">
  <label>
    <input type="checkbox" bind:checked={$options.centered} />
    Centered
  </label>
  <label>
    <input type="checkbox" bind:checked={$options.padding} />
    Padding
  </label>
  <label>
    <input type="checkbox" bind:checked={$options.outline} />
    Outline
  </label>
</div>

<style>
  div {
    padding: 0.66rem;
  }
  div > :not(:first-child) {
    margin-left: 1rem;
  }
</style>
