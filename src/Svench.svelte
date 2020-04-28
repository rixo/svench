<script>
  import { onDestroy } from 'svelte'
  import { writable, derived } from 'svelte/store'
  import navaid from 'navaid'
  import { setContext, makeNamer as _makeNamer, noop } from './util.js'
  import createRouter from './router.js'
  import Router from './Router.svelte'
  import AppContext from './AppContext.svelte'
  import addRegister from './register.js'
  // import test from './test.js'

  import ViewBox from './app/ViewBox.svelte'
  import RenderBox from './app/RenderBox.svelte'
  import Fallback from './app/Fallback.svelte'
  import DefaultIndex from './app/DefaultIndex.svelte'

  import routes$ from '../routes.js'
  import extras$ from '../routes.extras.js'

  export let localStorageKey = 'Svench'

  export let base = '/'
  export let fallback = null

  export let fixed = true

  export let defaults = {}

  // --- focus (view only) routing ---

  const q = new URLSearchParams(window.location.search)
  const single = q.has('only')
  const raw = q.has('raw')
  const naked = q.has('naked')

  // --- options ---

  const stateOptions = [
    'fullscreen',
    'centered',
    'outline',
    'padding',
    'focus',
    'raw',
    'naked',
    'canvasBackground',
    'viewBackground',
  ]

  const localOptions = ['menuWidth', 'extrasHeight']

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
    defaultViewName: index => `View ${index}`,
    // time before which view index is reset (for HMR)
    registerTimeout: 100,
    renderTimeout: 100,
    menuWidth: 200,
    extrasHeight: 200,
    // ui
    centered: false,
    outline: false,
    padding: false,
    fullscreen: false,
    canvasBackground: '',
    viewBackground: '#fff',
    ...defaults,
    ...readStoredOptions(),
    ...readParamsOptions(),
  })

  // --- local state (query params) ---

  const updateState = opts => {
    if (localStorageKey && window.localStorage) {
      const values = Object.fromEntries(
        localOptions.map(name => [name, opts[name]])
      )
      localStorage.setItem(localStorageKey, JSON.stringify(values))
    }

    // NOTE using history._replaceState to avoid useless looping with Routify
    // _replaceState is the original replaceState before Routify hacks it
    if (window.history && history._replaceState) {
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
        history._replaceState({}, '', url)
      }
    }
  }

  $: updateState($options)

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

  const router = createRouter({
    base,
    getRoutes: () => $_routes,
    DefaultIndex,
  })

  router.onMatch = () => {
    $options.enabled = true
  }

  // --- augment ---

  const addSource = route => {
    route.extra = derived(extras$, extras => extras[route.id] || {})
  }

  const _routes = derived(routes$, ({ routes }) => {
    const files = routes.filter(x => x.import)
    files.forEach(addRegister({ makeNamer, router, routes: _routes }))
    files.forEach(addSource)

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

  // --- focus ---

  const extras = writable(null)

  let focus = false

  $: if (!focus) $extras = null

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
    naked,
    options,
    makeNamer,
    router: {
      resolve: (...args) => router.resolve(...args),
      current: router.current,
      error: router.error,
    },
    routes: _routes,
    //   route$,
    //   meta,
    tree,

    extras,

    ViewBox,
    RenderBox,
    Fallback,
  })

  onDestroy(router.listen())
</script>

{#if $options.enabled}
  {#if single}
    <Router bind:focus />
  {:else}
    <AppContext App={import('./app/App.svelte')} {focus}>
      <Router bind:focus />
    </AppContext>
  {/if}
{:else}
  <svelte:component this={fallback} />
{/if}
