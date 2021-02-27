<script context="module">
  const scrollOverflow = el => {
    let raf

    const toggleClass = (cls, on) => {
      const method = on ? 'add' : 'remove'
      el.classList[method](cls)
    }

    const update = () => {
      raf = null
      const scroll = el.scrollLeft
      toggleClass('svench--left-overflow', scroll > 0)
      toggleClass(
        'svench--right-overflow',
        el.scrollWidth - (scroll + el.clientWidth) > 0.2
      )
    }

    el.addEventListener('scroll', () => {
      if (!raf) requestAnimationFrame(update)
    })

    update()
  }
</script>

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

  <div
    use:scrollOverflow
    class="svench-toolbar-wrapper svench-toolbar-scroller">
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
    <label class="svench-toolbar-select-label" for={null}>
      <span>Canvas</span>
      <BackgroundSelect
        aliases={$options.backgroundAliases}
        colors={$options.canvasBackgrounds}
        bind:value={$options.canvasBackground} />
    </label>
    <label class="svench-toolbar-select-label" for={null}>
      <span>Background</span>
      <BackgroundSelect
        aliases={$options.backgroundAliases}
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
    <div class="svench-toolbar-padder">&nbsp;</div>
  </div>
  <!-- scroller -->

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
