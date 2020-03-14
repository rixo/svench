<script>
  import RegisterRoutes from './RegisterRoutes.svelte'
  import { setContext } from './util.js'
  import { createStores } from './stores.js'

  import Menu from './app/Menu.svelte'
  import { Router } from '@sveltech/routify'

  export let routes = []

  export let fixed = true

  const { pages, tree, routes: rs } = createStores()

  setContext({ render: false, routes: rs })
</script>

<RegisterRoutes {pages} {routes} routesStore={rs}></RegisterRoutes>

<div class="svench svench" class:fixed>
  <section class="menu">
    <Menu items={$tree} />
  </section>

  <main>
    <Router routes={$rs} />
  </main>
</div>

<style>
  div {
    --light-1: rgba(141, 169, 196, 1);
    --light-1-r: white;
    --light-2: rgba(238, 244, 237, 1);
    --light-2-r: #242e36;

    --primary: rgba(19, 64, 116, 1);
    --primary-r: var(--light-1);
    --secondary: rgba(19, 49, 92, 1);
    --secondary-r: #fff;
    --tertiary: rgba(11, 37, 69, 1);
    --tertiary-r: var(--light-1);

    --gray: #aaa;
    --gray-light: #eee;
  }

  :global(body) {
    color: #333;
    margin: 0;
    padding: 8px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  .svench.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .menu {
    box-sizing: border-box;
    float: left;
    min-width: 200px;
    max-width: 240px;
    padding: 16px;
    margin: 0;
    height: 100%;
    overflow: auto;
    background-color: var(--light-2);
    box-shadow: inset -16px 0 12px -16px rgba(0, 0, 0, 0.2);
  }

  main {
    height: 100%;
    overflow: auto;
  }
</style>
