<script>
  import { setContext } from './util.js'

  export let router
  export let routes
  export let makeNamer
  export let register

  export let route
  export let component

  setContext({
    router,
    routes,
    route,
    register,
    raw: true,
    makeNamer,
    getViewName: makeNamer(),
  })
</script>

<svelte:component this={component} />
