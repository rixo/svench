<script>
  import { onDestroy } from 'svelte'
  import { writable, derived } from 'svelte/store'
  import navaid from 'navaid'
  import { setContext, makeNamer as _makeNamer, noop } from './util.js'
  import createRouter from './router.js'
  import Router from './Router.svelte'
  import App from './app/App.svelte'
  import AppContext from './AppContext.svelte'
  import addRegister from './register.js'
  // import test from './test.js'

  import routes$ from '../routes.js'

  export let localStorageKey = 'Svench'

  export let base = '/'
  export let fallback = null

  export let fixed = true

  export let defaults = {}

  // --- focus (view only) routing ---

  const q = new URLSearchParams(window.location.search)
  const single = q.has('focus')
  const raw = q.has('raw')

  // --- options ---

  const stateOptions = ['fullscreen', 'centered', 'outline', 'padding']

  const localOptions = ['menuWidth']

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

  const readStoredOptions =
    localStorageKey && window.localStorage
      ? () => {
          const stored = localStorage.getItem(localStorageKey)
          return (stored && JSON.parse(stored)) || {}
        }
      : noop

  const options = writable({
    fixed,
    enabled: !fallback,
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
    // ...readStoredOptions(),
    // ...readParamsOptions(),
  })

  // // --- local state (query params) ---
  //
  // const updateState = opts => {
  //   if (localStorageKey && window.localStorage) {
  //     const values = Object.fromEntries(
  //       localOptions.map(name => [name, opts[name]])
  //     )
  //     localStorage.setItem(localStorageKey, JSON.stringify(values))
  //   }
  //
  //   // NOTE using history._replaceState to avoid useless looping with Routify
  //   // _replaceState is the original replaceState before Routify hacks it
  //   if (window.history && history._replaceState) {
  //     const q = new URLSearchParams(window.location.search)
  //     stateOptions.forEach(name => {
  //       const value = opts[name]
  //       if (value === false || value == null) {
  //         q.delete(name)
  //       } else {
  //         q.set(name, value)
  //       }
  //     })
  //     let url = location.pathname
  //     const qs = q.toString()
  //     if (qs.length > 0) {
  //       url += '?' + qs.replace(/=true(?=&|$)/g, '')
  //     }
  //     const currentUrl = location.pathname + location.search
  //     if (url !== currentUrl) {
  //       history._replaceState({}, '', url)
  //     }
  //   }
  // }
  //
  // $: $route, updateState($options)
  //
  // // --- augmented routes ---
  //
  // $: $routes = augmentRoutes($inputRoutes.routes)
  //
  // // --- getRenderName ---
  //
  // const getRenderName = makeNamer(() => $options)
  //
  // // --- view ---
  //
  // const getView = () => new URLSearchParams(window.location.search).get('view')
  //
  // const view = writable()
  // const focus = writable(false)
  //
  // $: $route$, ($view = getView() || true)
  // $: $focus = $view !== true
  //
  // // --- route ---
  //
  // const route$ = route
  // // $: $route$ = $route

  const makeNamer = () => _makeNamer(() => $options)

  // --- fallback ---

  if (fallback) {
    const rootRouter = navaid('/', () => {
      $options.enabled = false
    })

    rootRouter.listen()

    onDestroy(rootRouter.unlisten)
  }

  // --- router ---

  const router = createRouter({ base, getRoutes: () => $_routes })

  router.onMatch = () => {
    $options.enabled = true
  }

  // --- augment ---

  const _routes = derived(routes$, ({ routes }) => {
    routes.forEach(addRegister({ makeNamer, router, routes: _routes }))

    const indexes = Object.fromEntries(
      routes
        .filter(route => route.path.endsWith('/index'))
        .map(route => [route.path.slice(0, -'/index'.length), route])
    )

    routes.forEach(route => {
      const index = indexes[route.path]
      if (index) {
        route.index = index
        index.indexOf = route
      }
    })

    return routes
  })

  // --- tree ---

  const tree = derived(routes$, x => x.tree)

  // // --- meta ---
  //
  // const meta = writable()
  //
  // $: $meta = $route && $route.meta
  //
  // // --- test ---
  //
  // // $: test($pages)

  // --- context ---

  setContext({
    raw,
    options,
    makeNamer,
    router,
    routes: _routes,
    //   route$,
    //   meta,
    tree,
    focus,
  })

  onDestroy(router.listen())
</script>

{#if $options.enabled}
  {#if single}
    <Router {router} />
  {:else}
    <AppContext>
      <App>
        <Router {router} />
      </App>
    </AppContext>
  {/if}
{:else}
  <svelte:component this={fallback} />
{/if}
