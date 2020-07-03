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
      <span>Centered</span>
    </label>
    <label class="svench-toolbar-checkbox">
      <input type="checkbox" bind:checked={$options.padding} />
      <span>Padding</span>
    </label>
    <label class="svench-toolbar-checkbox">
      <input type="checkbox" bind:checked={$options.outline} />
      <span>Outline</span>
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
