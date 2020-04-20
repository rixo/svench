<script>
  import Menu from './Menu.svelte'
  import MenuResizeHandle from './MenuResizeHandle.svelte'
  import Toolbar from './Toolbar.svelte'
  import DefaultTheme from './DefaultTheme.svelte'

  export let options
  export let tree
  export let focus

  $: ({ fixed, fullscreen } = $options)

  let menuWidth = $options.menuWidth

  $: $options.menuWidth = menuWidth

  const onKeydown = e => {
    if (e.key === 'Escape') {
      $options.fullscreen = false
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<DefaultTheme>
  <div
    class="svench svench"
    class:fixed
    class:fullscreen
    style={fullscreen ? null : `padding-left: ${menuWidth}px`}>
    <section class="ui menu" style="width: {menuWidth}px">
      <h1>
        <a href="/">
          <span class="icon">🔧</span>
          Svench
        </a>
      </h1>
      <Menu tree={$tree} />
      <MenuResizeHandle bind:width={menuWidth} />
    </section>

    <section class="ui svench-toolbar" style="left: {menuWidth}px">
      <Toolbar />
    </section>

    <div class="ui svench-toolbar-placeholder" />

    <main class:focus style={!fullscreen && `left: ${menuWidth}px`}>
      <div class="svench canvas" class:focus>
        <slot />
      </div>

      <!-- {#if focus}
        <div class="ui extras">
          <slot name="extras" />
        </div>
      {/if} -->
    </main>
  </div>
</DefaultTheme>

<style>
  h1 {
    margin: 0.5rem 1rem 1.5rem;
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
    transform: rotateY(180deg);
  }

  :global(body) {
    padding: 0;
  }

  .svench {
    --toolbar-height: 3rem;
  }
  .menu {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
  }
  .svench-toolbar {
    position: fixed;
    top: 0;
    right: 0;
    height: var(--toolbar-height);
    background-color: var(--white);
    z-index: 2;
  }
  .svench-toolbar-placeholder {
    height: var(--toolbar-height);
  }

  .svench.fullscreen .ui {
    display: none;
  }
  .svench.fullscreen main {
    top: 0;
  }

  .menu {
    margin: 0;
    background-color: var(--light-2);
    box-shadow: inset -16px 0 12px -16px rgba(0, 0, 0, 0.2);
    overflow: auto;
  }

  main {
    display: flex;
  }
  main .canvas {
    flex: 1;
  }
  main {
    /* NOTE we want the canvas to fill available space, or it is hard to pick
       in dev tools (which end users might want to do to find missing cmp) */
    min-height: calc(100% - var(--toolbar-height));
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

  .svench-toolbar {
    border-bottom: 1px solid var(--gray-light);
  }

  /* .extras {
    border-top: 1px solid var(--gray-light);
    padding: 1rem;
  } */
</style>
