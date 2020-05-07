<script>
  import Menu from './Menu.svelte'
  import ResizeHandle from './ResizeHandle.svelte'
  import Toolbar from './Toolbar.svelte'
  import DefaultTheme from './DefaultTheme.svelte'
  import ExtrasPanel from './ExtrasPanel.svelte'

  export let options
  export let tree
  export let router
  export let focus
  export let extras

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

<DefaultTheme>
  <div
    on:mousemove={mousemove}
    class="svench-app"
    class:fixed
    class:fullscreen
    style={fullscreen ? null : `padding-left: ${menuWidth}px`}>

    <section class="svench-ui menu" style="width: {menuWidth}px">
      <h1>
        <a href="/">
          <!-- <span class="icon">🔧</span> -->
          <span class="icon">🔬</span>
          Svench
        </a>
      </h1>
      <Menu tree={$tree} {router} />
      <ResizeHandle right bind:width={menuWidth} />
    </section>

    <section class="svench-ui svench-app-toolbar" style="left: {menuWidth}px">
      <Toolbar {options} />
    </section>

    <div class="svench-ui svench-app-toolbar-placeholder" />

    <main class:focus style={mainStyle}>
      <div class="svench-app canvas" class:focus>
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
</DefaultTheme>

<style>
  h1 {
    margin: 0.5em 1em 1.5em;
    padding: 0;
    white-space: nowrap;
  }
  h1 a {
    text-decoration: none;
    color: #79889a;
  }
  h1 .icon {
    opacity: 0.5;
    display: inline-block;
    transform: rotateY(180deg) scale(1.25) translateY(-0.12em);
    font-weight: normal;
  }

  /* :global(body) {
    padding: 0;
    margin: 0;
    color: #333;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  } */

  .svench-app {
    --toolbar-height: 3em;
    --extras-height: 15em;
  }
  .menu {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
  }
  .svench-app-toolbar {
    position: fixed;
    top: 0;
    right: 0;
    height: var(--toolbar-height);
    background-color: var(--white);
    z-index: 2;
  }
  .svench-app-toolbar-placeholder {
    height: var(--toolbar-height);
  }
  .svench-extras {
    position: fixed;
    bottom: 0;
    right: 0;
    background-color: var(--white);
    z-index: 2;
  }

  .svench-app.fullscreen .svench-ui {
    display: none;
  }
  .svench-app.fullscreen main,
  .svench-app.fullscreen main.focus {
    top: 0;
    bottom: 0;
  }

  .menu {
    margin: 0;
    background-color: var(--light-2);
    box-shadow: inset -16px 0 12px -16px rgba(0, 0, 0, 0.2);
    overflow: auto;
  }

  main {
    display: flex;
    flex-direction: column;
  }
  main .canvas {
    flex: 1;
  }
  main {
    /* NOTE we want the canvas to fill available space, or it is hard to pick
       in dev tools (which end users might want to do to find missing cmp) */
    min-height: calc(100% - var(--toolbar-height) - var(--extras-height));
  }
  main.focus {
    position: fixed;
    overflow: auto;
    top: var(--toolbar-height);
    bottom: 0;
    left: 0;
    right: 0;
  }
  main.focus .canvas {
    display: flex;
    flex-direction: column;
  }

  /*--- theme ---*/

  .svench-app-toolbar {
    border-bottom: 1px solid var(--gray-light);
  }

  .svench-extras {
    border-top: 1px solid var(--gray-light);
    padding: 0;
    display: flex;
    flex-direction: column;
  }
</style>
