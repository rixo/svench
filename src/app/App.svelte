<script>
  import { getContext } from '../util'
  import Menu from './Menu.svelte'
  import MenuResizeHandle from './MenuResizeHandle.svelte'
  import Toolbar from './Toolbar.svelte'
  import ThemeOranges from './ThemeOranges.svelte'

  const { options, tree, focus } = getContext()

  $: ({ fixed, fullscreen } = $options)

  const onKeydown = e => {
    if (e.key === 'Escape') {
      $options.fullscreen = false
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<ThemeOranges>
  <div
    class="svench svench"
    class:fixed
    class:fullscreen
    style="grid-template-columns: {$options.menuWidth}px auto;">
    <section class="ui menu">
      <h1>
        <a href="/">
          <span class="icon">🔧</span>
          Svench
        </a>
      </h1>
      <Menu items={$tree} />
      <MenuResizeHandle bind:width={$options.menuWidth} />
    </section>

    <section class="ui toolbar">
      <Toolbar />
    </section>

    <div class="canvas" class:focus={$focus} data-routify="scroll-lock">
      <slot />
    </div>
  </div>
</ThemeOranges>

<style>
  h1 {
    margin: 0.5rem 1rem;
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

  .svench {
    display: grid;
    grid-template-columns: 200px auto;
    grid-template-rows: 3rem auto;
    /* color: #333; */
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }
  .canvas {
    grid-column-start: 2;
  }

  .svench.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .svench.fullscreen {
    display: flex;
  }
  .svench.fullscreen .ui {
    display: none;
  }
  .svench.fullscreen .canvas {
    flex: 1;
  }

  .menu {
    box-sizing: border-box;
    float: left;
    /* min-width: 200px;
    max-width: 240px; */
    /* padding: 16px; */
    margin: 0;
    height: 100vh;
    overflow: auto;
    background-color: var(--light-2);
    box-shadow: inset -16px 0 12px -16px rgba(0, 0, 0, 0.2);
    position: relative; /* for MenuResizeHandle */
  }

  .toolbar {
    border-bottom: 1px solid var(--gray-light);
  }

  .canvas {
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
  .canvas.focus :global(> *) {
    display: none;
  }
  .canvas.focus :global(> .svench.view) {
    display: inherit;
  }
</style>
