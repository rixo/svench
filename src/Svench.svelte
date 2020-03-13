<script>
  import { Router } from '@sveltech/routify'

  import { augmentRoutes } from './routify'
  import Register from './Register.svelte'
  import Menu from './app/Menu.svelte'
  import { pages, tree } from './Svench.state.js'
  import { setContext } from './util.js'

  let userRoutes
  export { userRoutes as routes }

  export let fixed = true

  const isPage = ({ isFallback }) => !isFallback

  const trimPages = _routes => {
    const leaves = []
    const trimmed = {}
    for (const route of _routes) {
      const { path, isIndex } = route
      trimmed[path] = $pages[path]
      if (isIndex) {
        trimmed[path] = route
      } else {
        leaves.push(route)
      }
    }
    $pages = trimmed
    return leaves
  }

  $: routes = augmentRoutes(userRoutes)

  $: _routes = routes.filter(isPage)

  // ensure removed pages are reflected (on HMR update)
  $: trimPages(_routes)

  setContext({})
</script>

{#each _routes as route (route.path)}
  <Register {route} {pages} />
{/each}

<div class="svench svench" class:fixed>
  <section class="menu">
    <Menu items={$tree} />
  </section>

  <main>
    <Router {routes} />
  </main>
</div>

<style>
  :root {
    --light-1: rgba(141, 169, 196, 1);
    --light-1-r: white;
    --light-2: rgba(238, 244, 237, 1);
    --light-2-r: #242e36;

    --primary: rgba(19, 64, 116, 1);
    --primary-r: var(--light-1);
    --secondary: rgba(19, 49, 92, 1);
    --secondary-r: var(--light-1);
    --tertiary: rgba(11, 37, 69, 1);
    --tertiary-r: var(--light-1);

    --gray: #aaa;
    --gray-light: #eee;
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
