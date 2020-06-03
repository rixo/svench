<script>
  import BackgroundSelect from './BackgroundSelect.svelte'

  export let options

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

<div class="svench-ui wrapper">
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
  <label>
    Canvas
    <BackgroundSelect
      colors={$options.canvasBackgrounds}
      bind:value={$options.canvasBackground} />
  </label>
  <label>
    Background
    <BackgroundSelect
      colors={$options.backgrounds}
      bind:value={$options.background} />
  </label>
  {#if $options.dev}
    <label>
      <input type="checkbox" bind:checked={$options.shadow} />
      Shadow
    </label>
  {/if}
  <div class="spacer" />
  <button aria-label="naked" on:click={goNaked} title="Render naked">↧</button>
  <button aria-label="raw" on:click={goRawNaked} title="Render raw">⇟</button>
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
    padding: 0 0.5em;
    height: var(--toolbar-height);
  }
  .wrapper > * {
    margin: 0.25em;
  }
  .spacer {
    flex-grow: 100;
  }

  .wrapper > label {
    margin: 0 0.5em;
  }
  label > input[type='checkbox'] {
    position: relative;
    top: 2px;
  }

  button {
    line-height: 0.8em;
    margin: 0 0.25em;
    padding: 0.4em;
  }
</style>
