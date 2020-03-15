<script>
  import Register from './Register.svelte'

  export let routes
  export let pages

  const isPage = ({ isFallback }) => !isFallback

  const trimPages = _routes => {
    const trimmed = {}
    for (const route of _routes) {
      const { path } = route
      trimmed[path] = []
    }
    $pages = trimmed
  }

  $: pageRoutes = routes.filter(isPage)

  // ensure removed pages are reflected (on HMR update)
  $: trimPages(pageRoutes)
</script>

{#each pageRoutes as route (route.path)}
  <Register {route} {pages} />
{/each}
