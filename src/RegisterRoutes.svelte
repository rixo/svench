<script>
  import Register from './Register.svelte'
  import { augmentRoutes } from './routify/index.js'

  export let pages
  export let inputRoutes
  export let routes

  const isPage = ({ isFallback }) => !isFallback

  const trimPages = _routes => {
    const trimmed = {}
    for (const route of _routes) {
      const { path } = route
      trimmed[path] = []
    }
    $pages = trimmed
  }

  $: augmented = augmentRoutes($inputRoutes)

  $: pageRoutes = augmented.filter(isPage)

  // ensure removed pages are reflected (on HMR update)
  $: trimPages(pageRoutes)

  $: routes.set(augmented)
</script>

{#each pageRoutes as route (route.path)}
  <Register {route} {pages} />
{/each}
