<script>
  import { getContext } from '../util.js'

  const { options } = getContext()

  const toggleFullscreen = () => {
    $options.fullscreen = !$options.fullscreen
  }
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
  <div class="spacer" />
  <button
    aria-label="fullscreen"
    on:click={toggleFullscreen}
    title="Toggle fullscreen (press ESC to escape)">
    ⛶
  </button>
</div>

<style>
  div {
    padding: 0.66rem;
  }
  div > :not(:first-child) {
    margin-left: 1rem;
  }
  .wrapper {
    display: flex;
    align-items: center;
  }
  .spacer {
    flex-grow: 100;
  }
</style>
