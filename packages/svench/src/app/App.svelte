<script>
  /* global OverlayScrollbars */

  import { tweened } from 'svelte/motion'
  import { circOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'
  import Menu from './Menu.svelte'
  import OmniSearchField from './OmniSearchField.svelte'
  import OmniSearchResults from './OmniSearchResults.svelte'
  import ResizeHandle from './ResizeHandle.svelte'
  import Toolbar from './Toolbar.svelte'
  import ExtrasPanel from './ExtrasPanel.svelte'
  import 'overlayscrollbars'
  import { swipeMenu } from './App.touch.js'

  export let options
  export let tree
  export let router
  export let focus
  export let extras
  export let search
  export let commands
  export let setScrollTarget

  const toolbarHeight = 48 // hmm

  $: ({
    fixed,
    fullscreen,
    menuVisible,
    menuWidth: _menuWidth,
    extrasHeight,
  } = $options)

  const onKeydown = e => {
    if (e.key === 'Escape') {
      $options.fullscreen = false
    }
  }

  $: hasExtras = extras && extras.source

  let outerWidth
  let innerWidth

  // when isPhone, menu autocloses and sizes to width
  $: isPhone = outerWidth <= 720

  // let menuWidth = getMenuWidth(window.innerWidth)
  $: menuWidth = isPhone
    ? Math.min(innerWidth - toolbarHeight, 0.95 * innerWidth)
    : _menuWidth || 220

  const menuOffset$ = tweened(
    $options.menuVisible ? $options.menuWidth || 220 : 0,
    {
      duration: (x0, x1) => Math.abs(x0 - x1) * 0.33,
      easing: circOut,
    }
  )

  let lastMenuVisible = $options.menuVisible
  let lastMenuWidth = $options.menuWidth
  let lastIsPhone = null

  // $: $menuOffset$ = menuVisible ? $options.menuWidth : 0
  $: {
    if (isPhone !== lastIsPhone || lastMenuWidth !== $options.menuWidth) {
      menuOffset$.set(menuVisible ? menuWidth : 0, { duration: 0 })
    } else if (lastMenuVisible !== $options.menuVisible) {
      menuOffset$.set(menuVisible ? menuWidth : 0)
    }
    lastMenuVisible = $options.menuVisible
    lastMenuWidth = $options.menuWidth
    lastIsPhone = isPhone
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
      margin-right: ${isPhone ? -menuOffset : 0}px;
      min-height: 100%;
    `
    mainStyle = `
      min-height: calc(100% - ${toolbarHeight}px - ${extrasHeight}px);
    `
    if (focus && hasExtras) {
      mainStyle += `bottom: ${extrasHeight}px;`
    }
  }

  $: ({ current } = router)
  let lastCurrent
  $: if ($current !== lastCurrent) {
    lastCurrent = $current
    if (isPhone) {
      $options.menuVisible = false
    }
  }

  let regionEl

  const overlayscrollbars = el => {
    OverlayScrollbars(el, {
      scrollbars: {
        autoHide: 'move',
      },
    })
  }

  const toggleMenu = x => {
    $options.menuVisible = x
  }

  const toggleVisibleMenu = x => {
    if (!$options.menuVisible) return
    toggleMenu(x)
  }
</script>

<svelte:window on:keydown={onKeydown} bind:outerWidth bind:innerWidth />

<div
  bind:this={regionEl}
  class="svench-app"
  class:svench-small-screen={isPhone}
  class:svench-focus={focus}
  class:svench-fullscreen={fullscreen}>
  <section
    use:swipeMenu={{ run: toggleVisibleMenu, regionEl }}
    class="svench-ui svench-app-menu"
    style="width: {menuWidth}px">
    <h1 class="svench-app-logo">
      <a href="/">
        <!-- <span class="svench-icon">🔬</span> -->
        Svench
      </a>
    </h1>
    <OmniSearchField {search} />
    <div
      class="svench-app-menu-menu"
      use:overlayscrollbars
      style="width: {menuWidth}px">
      <Menu tree={$tree} {router} />
    </div>
    <div class="svench-app-menu-brand">Svench</div>
  </section>

  <div class="svench-app-body" style={bodyStyle}>
    <ResizeHandle left bind:width={$options.menuWidth} />

    {#if isPhone && menuOffset === menuWidth}
      <div
        class="svench-app-body-mask"
        in:fade={{ duration: 100 }}
        on:click={commands.toggleMenu} />
    {/if}

    <section
      class="svench-ui svench-app-toolbar"
      style="left: {menuOffset}px; right: {isPhone ? -menuOffset : 0}px">
      <Toolbar {options} {commands} />
    </section>

    <main
      use:setScrollTarget
      use:swipeMenu={{ run: toggleMenu, regionEl }}
      class="svench-app-main"
      class:svench-app-focus={focus}
      style={mainStyle}>
      <div class="svench-app-canvas">
        <slot />
      </div>
    </main>

    {#if hasExtras}
      <section
        class="svench-ui svench-app-extras"
        style="height: {extrasHeight}px">
        <ExtrasPanel {extras} />
        <ResizeHandle top shrink bind:width={$options.extrasHeight} />
      </section>
    {/if}

    <OmniSearchResults {search} />
  </div>
</div>
