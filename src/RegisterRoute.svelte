<script>
  import { onDestroy } from 'svelte'
  import { setContext, constStore, false$, makeNamer } from './util.js'

  export let options
  export let route
  export let routes

  export let callback

  let views = []

  let component

  let timeout
  const schedule = callback => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, $options.registerTimeout)
  }

  onDestroy(() => {
    clearTimeout(timeout)
  })

  const loadComponent = loader => {
    component = null
    Promise.resolve()
      .then(loader)
      .then(cmp => {
        views = []
        component = cmp
      })
      .catch(error => {
        callback(error)
      })
  }

  const _route = $routes.find(({ path }) => path === route.path)

  const loader =
    _route &&
    (_route.registerTarget ? _route.registerTarget.component : _route.component)

  if (loader) loadComponent(loader)

  export const register = name => {
    views.push(name || $options.defaultViewName(views.length + 1))

    callback(null, views)

    schedule(() => {
      views = []
    })
  }

  const getRenderName = makeNamer(() => $options)

  setContext({
    options,
    routes,
    route$: constStore(_route),
    registerOnly: true,
    register,
    render: false$,
    getRenderName,
  })
</script>

{#if component}
  <svelte:component this={component} />
{/if}
