<script>
  import { tweened } from 'svelte/motion'
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

  $: ({ fixed, fullscreen, menuVisible } = $options)

  const onKeydown = e => {
    if (e.key === 'Escape') {
      $options.fullscreen = false
    }
  }

  $: hasExtras = extras && extras.source

  const menuOffset$ = tweened($options.menuVisible ? $options.menuWidth : 0, {
    duration: (x0, x1) => Math.abs(x0 - x1) * 0.5,
  })

  let lastMenuVisible = $options.menuVisible
  let lastMenuWidth = $options.menuWidth

  // $: $menuOffset$ = menuVisible ? $options.menuWidth : 0
  $: {
    if (lastMenuVisible !== $options.menuVisible) {
      menuOffset$.set(menuVisible ? $options.menuWidth : 0)
    } else if (lastMenuWidth !== $options.menuWidth) {
      menuOffset$.set(menuVisible ? $options.menuWidth : 0, { duration: 0 })
    }
    lastMenuVisible = $options.menuVisible
    lastMenuWidth = $options.menuWidth
  }

  $: menuOffset = $menuOffset$

  let bodyStyle
  let mainStyle

  $: if (fullscreen) {
    bodyStyle = ''
    mainStyle = ''
  } else {
    bodyStyle = `
      // left: ${focus ? menuOffset : 0}px;
      margin-left: ${menuOffset}px;
      min-height: 100%;
    `
    mainStyle = `
      min-height: calc(100% - 48px - ${$options.extrasHeight}px);
    `
    if (focus && hasExtras) {
      mainStyle += `bottom: ${$options.extrasHeight}px;`
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
  class:svench-app-focus={focus}
  class:svench-fullscreen={fullscreen}>
  <!-- style={fullscreen ? null : `padding-left: ${menuOffset}px`}> -->

  <section class="svench-ui svench-menu" style="width: {$options.menuWidth}px">
    <h1 class="svench-app-logo">
      <a href="/">
        <!-- <span class="icon">🔧</span> -->
        <span class="svench-icon">🔬</span>
        Svench
      </a>
    </h1>
    <Menu tree={$tree} {router} />
  </section>

  <div class="svench-app-body" style={bodyStyle}>
    <ResizeHandle left bind:width={$options.menuWidth} />

    <section class="svench-ui svench-app-toolbar" style="left: {menuOffset}px">
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
      <section
        class="svench-ui svench-extras"
        style="left: {menuOffset}px; height: {$options.extrasHeight}px">
        <ExtrasPanel {extras} />
        <ResizeHandle top shrink bind:width={$options.extrasHeight} />
      </section>
    {/if}
  </div>
</div>
