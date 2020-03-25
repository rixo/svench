<script>
  import { onDestroy } from 'svelte'
  import { writable } from 'svelte/store'
  import { setContext, noop } from './util.js'
  import { createStores } from './stores.js'
  import { augmentRoutes } from './routify/index.js'

  import { Router, route } from '@sveltech/routify'

  let inputRoutes
  export { inputRoutes as routes }

  export let fixed = true

  export let defaults

  const { options, tree, routes, register, destroy } = createStores()

  // --- options ---

  const stateOptions = [
    'fullscreen',
    'centered',
    'outline',
    'padding',
    'menuWidth',
  ]

  const readParamsOptions = () => {
    const q = new URLSearchParams(window.location.search)
    const opts = {}
    stateOptions.forEach(name => {
      if (!q.has(name)) return
      const v = q.get(name)
      if (v === 'false') return
      opts[name] =
        v === 'true' || v === '' ? true : /^\d+$/.test(v) ? parseInt(v) : v
    })
    return opts
  }

  const queryOptions = readParamsOptions()

  $: $options = {
    fixed,
    defaultViewName: index => `view ${index}`,
    // time before which view index is reset (for HMR)
    registerTimeout: 100,
    renderTimeout: 100,
    menuWidth: 200,
    // ui
    centered: false,
    outline: false,
    padding: false,
    fullscreen: false,
    ...defaults,
    ...queryOptions,
  }

  const updateState =
    window.history && history.replaceState
      ? opts => {
          const q = new URLSearchParams(window.location.search)
          stateOptions.forEach(name => {
            const value = opts[name]
            if (value === false || value == null) {
              q.delete(name)
            } else {
              q.set(name, value)
            }
          })
          let url = location.pathname
          const qs = q.toString()
          if (qs.length > 0) {
            url += '?' + qs.replace(/=true(?=&|$)/g, '')
          }
          const currentUrl = location.pathname + location.search
          if (url !== currentUrl) {
            history.replaceState({}, '', url)
          }
        }
      : noop

  // eslint-disable-next-line no-unused-expressions
  $: $route, updateState($options)

  // --- augmented routes ---

  $: $routes = augmentRoutes($inputRoutes)

  // --- getRenderName ---

  let index = 0

  let timeout
  const reset = () => {
    index = 0
  }

  // TODO dedup (in RegisterRoute)
  const getRenderName = name => {
    clearTimeout(timeout)
    timeout = setTimeout(reset, $options.renderTimeout)
    index++
    return name == null ? $options.defaultViewName(index) : name
  }

  // --- view ---

  const getView = () => new URLSearchParams(window.location.search).get('view')

  const view = writable()
  const focus = writable(false)

  $: $view = getView($route) || true
  $: $focus = $view !== true

  // --- route ---

  const route$ = writable()

  const routeFinder = routes => route => {
    const result = routes.find(x => x.path === route.path)
    // if (!result) debugger
    return result
  }

  $: findRoute = routeFinder($routes)
  $: $route$ = findRoute($route)

  // --- context ---

  setContext({
    options,
    routes,
    route$,
    findRoute: ({ path }) => $routes.find(x => x.path === path),
    tree,
    register,
    getRenderName,
    render: view,
    focus,
  })

  onDestroy(destroy)
</script>

<!-- <pre>{JSON.stringify($tree, false, 2)}</pre> -->

{#if $routes.length > 0}
  <Router routes={$routes} />
{/if}
