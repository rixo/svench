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

  let registers = []

  // renders registering components off screen to prevent DOM polution from
  // components that contains something else than <View /> components
  const offScreen = document.createElement('div')

  const registerRoutes = routes => {
    for (const cmp of registers) {
      cmp.$destroy()
    }
    registers = []
    for (const route of routes) {
      const cmp = new Register({
        target: offScreen,
        props: { route, pages },
      })
      registers.push(cmp)
    }
  }

  $: registerRoutes(pageRoutes)
</script>
