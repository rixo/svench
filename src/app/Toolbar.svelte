<script>
  import BackgroundSelect from './BackgroundSelect.svelte'

  export let options
  export let commands

  $: ({ toggleMenu, refresh, goNaked, goRaw, toggleFullscreen } = commands)
</script>

<div class="svench-ui svench-toolbar-wrapper">
  {#if toggleMenu}
    <button aria-label="menu" on:click={toggleMenu} title="Toggle menu">
      ☰
    </button>
    <div class="svench-toolbar-padder" />
  {/if}
  <div class="svench-toolbar-wrapper svench-toolbar-scroller">
    <label class="svench-toolbar-checkbox">
      <input type="checkbox" bind:checked={$options.centered} />
      Centered
    </label>
    <label class="svench-toolbar-checkbox">
      <input type="checkbox" bind:checked={$options.padding} />
      Padding
    </label>
    <label class="svench-toolbar-checkbox">
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
    <div class="svench-toolbar-spacer" />
    <button aria-label="naked" on:click={goNaked} title="Render naked">
      ↧
    </button>
    <button aria-label="raw" on:click={goRaw} title="Render raw">⇟</button>
  </div>
  <div class="svench-toolbar-padder" />
  <button aria-label="refresh" on:click={refresh} title="Rerender everything">
    ⟳
  </button>
  <div class="svench-toolbar-padder" />
  <button
    aria-label="fullscreen"
    on:click={toggleFullscreen}
    title="Toggle fullscreen (press ESC to escape)">
    ⛶
  </button>
</div>

<style>
  .svench-toolbar-wrapper {
    display: flex;
    align-items: center;
    padding: 0 0.5em;
    height: var(--toolbar-height);
    flex-wrap: nowrap;
  }
  .svench-toolbar-wrapper > * {
    margin: 0.25em;
  }
  .svench-toolbar-spacer {
    flex-grow: 100;
  }
  .svench-toolbar-padder {
    width: 0.33em;
  }

  .svench-toolbar-scroller {
    flex: 1;
    padding: 0;
    margin: 0;
    overflow: auto;
  }

  .svench-toolbar-wrapper > label {
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

  /* label.svench-toolbar-checkbox { */
  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 90%;
  }
</style>
