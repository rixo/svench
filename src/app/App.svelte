<script>
  import Menu from './Menu.svelte'
  import ResizeHandle from './ResizeHandle.svelte'
  import Toolbar from './Toolbar.svelte'
  import ExtrasPanel from './ExtrasPanel.svelte'

  export let options
  export let tree
  export let router
  export let focus
  export let extras
  export let commands

  $: ({ fixed, fullscreen } = $options)

  let menuWidth = $options.menuWidth
  let extrasHeight = $options.extrasHeight

  $: $options.menuWidth = menuWidth
  $: $options.extrasHeight = extrasHeight

  const onKeydown = e => {
    if (e.key === 'Escape') {
      $options.fullscreen = false
    }
  }

  $: hasExtras = extras && extras.source

  let mainStyle

  $: if (fullscreen) {
    mainStyle = ''
  } else {
    mainStyle = `
      left: ${menuWidth}px;
      min-height: calc(100% - var(--toolbar-height) - ${extrasHeight}px);
    `
    if (focus && hasExtras) {
      mainStyle += `bottom: ${extrasHeight}px;`
    }
  }

  const mousemove = e => {
    if (e.target.tagName !== 'A') return
    if (e.target.dataset.prefetched) return
    e.target.dataset.prefetched = true
    const { href } = e.target
    if (!href) return
    const route = router.findRoute(href)
    if (!route) return
    if (!route.import) return
    if (route.$resolved) return
    Promise.resolve(route.import())
      .then(() => {
        route.$resolved = true
      })
      .catch(() => {
        e.target.dataset.prefetched = false
      })
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div
  on:mousemove={mousemove}
  class="svench-app"
  class:svench-fixed={fixed}
  class:svench-fullscreen={fullscreen}
  style={fullscreen ? null : `padding-left: ${menuWidth}px`}>

  <section class="svench-ui svench-menu" style="width: {menuWidth}px">
    <h1 class="svench-app-logo">
      <a href="/">
        <!-- <span class="icon">🔧</span> -->
        <span class="svench-icon">🔬</span>
        Svench
      </a>
    </h1>
    <Menu tree={$tree} {router} />
    <ResizeHandle right bind:width={menuWidth} />
  </section>

  <section class="svench-ui svench-app-toolbar" style="left: {menuWidth}px">
    <Toolbar {options} {commands} />
  </section>

  <div class="svench-ui svench-app-toolbar-placeholder" />

  <main
    class="svench-app-main"
    class:svench-app-focus={focus}
    style={mainStyle}>
    <div class="svench-app svench-app-canvas">
      <slot />
    </div>
  </main>

  {#if hasExtras}
    <aside
      class="svench-ui svench-extras"
      style="left: {menuWidth}px; height: {extrasHeight}px">
      <ExtrasPanel {extras} />
      <ResizeHandle top bind:width={extrasHeight} />
    </aside>
  {/if}
</div>
