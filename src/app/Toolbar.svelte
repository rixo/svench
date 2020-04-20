<script>
  import { getContext } from '../util.js'

  const { options } = getContext()

  const toggleFullscreen = () => {
    $options.fullscreen = !$options.fullscreen
  }

  const goRaw = () => {
    const sep = location.href.includes('?') ? '&' : '?'
    location.href = location.href + sep + 'only&raw'
  }

  const goNaked = () => {
    const sep = location.href.includes('?') ? '&' : '?'
    location.href = location.href + sep + 'only&naked'
  }

  const goRawNaked = () => {
    const sep = location.href.includes('?') ? '&' : '?'
    location.href = location.href + sep + 'only&raw&naked'
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
  <button aria-label="raw" on:click={goRaw} title="Render raw">↧</button>
  <button aria-label="naked" on:click={goNaked} title="Render naked">⇟</button>
  <button
    aria-label="raw naked"
    on:click={goRawNaked}
    title="Render raw & naked">
    ⤓
  </button>
  <button
    aria-label="fullscreen"
    on:click={toggleFullscreen}
    title="Toggle fullscreen (press ESC to escape)">
    ⛶
  </button>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    padding: 0.66rem;
  }
  .wrapper > :not(:first-child) {
    margin-left: 1rem;
  }
  .spacer {
    flex-grow: 100;
  }
</style>
