<script>
  import Register from './Register.svelte'
  import { augmentRoutes } from './routify/index.js'

  export let pages
  export let routes = []
  export let routesStore

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

  $: _routes = augmentRoutes(routes)

  $: _routes = _routes.filter(isPage)

  // ensure removed pages are reflected (on HMR update)
  $: trimPages(_routes)

  $: routesStore.set(_routes)
</script>

{#each _routes as route (route.path)}
  <Register {route} {pages} />
{/each}
