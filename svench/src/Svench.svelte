<script>
  import { onDestroy } from 'svelte'
  import { writable, readable, derived } from 'svelte/store'
  import navaid from 'navaid'
  import { setContext, makeNamer as _makeNamer } from './util.js'
  import createRouter from './router.js'
  import Router from './Router.svelte'
  import AppContext from './AppContext.svelte'
  import UiResolver from './UiResolver.svelte'
  import addRegister from './register.js'
  import createOptions from './Svench.options.js'
  import createCommands from './Svench.commands.js'
  import Scroll from './scroll.js'
  import Busy from './Svench.busy.js'

  // import test from './test.js'

  import Fallback from './app/Fallback.svelte'
  import DefaultIndex from './app/DefaultIndex.svelte'

  let routes$ = readable({ routes: [], tree: {} })
  export { routes$ as routes }

  export let ui
  export let lightUi = null
  export let shadowUi = null

  export let fixBodyStyle = true

  export let base = '/'
  export let fallback = null

  // --- focus (view only) routing ---

  const q = new URLSearchParams(window.location.search)
  const single = q.has('only')
  const raw = q.has('raw')
  const naked = q.has('naked')

  // --- options ---

  const options = createOptions({
    enabled: !fallback,
    ...$$props,
  })

  const busy = Busy()

  const {
    navigate: scrollNav,
    setTarget: setScrollTarget,
    dispose: disposeScroll,
  } = Scroll(() => $options, busy.hasBeenIdle)

  onDestroy(disposeScroll)

  // $: updateState($options)

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
  // WARNING after scroll! (for pop/push state events precendence)

  const normalizePath = path =>
    String(path)
      .toLowerCase() // TODO case-sensitive URL option
      .replace(/ /g, '_')

  const router = createRouter({
    base,
    getRoutes: () => $_routes,
    normalizePath,
    DefaultIndex,
  })

  router.onMatch = () => {
    $options.enabled = true
  }

  // --- augment ---

  // const addSource = route => {
  //   route.extra = derived(extras$, extras => extras[route.id] || {})
  // }

  const addNormalized = route => {
    route.normalPath = normalizePath(route.path)
    // route.indexPath = route.path.replace(/(?:\/index)*$/, '') || '/'
  }

  const _routes = derived(routes$, ({ routes }) => {
    routes.forEach(addNormalized)

    const files = routes.filter(x => x.import)
    files.forEach(addRegister({ makeNamer, router, routes: _routes }))
    // files.forEach(addSource)

    const indexes = Object.fromEntries(
      files
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

  const prefetchWhenIdle = async (routes, isCurrent) => {
    await busy.idle()
    for (const route of routes) {
      const { import: fn } = route
      if (!isCurrent()) return
      if (!fn) continue
      try {
        await busy.idle()
        await fn()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error prefetching route', route, err)
      }
    }
  }

  let lastRoutes = null

  const isCurrentRoutes = () => $_routes === lastRoutes

  // fix HMR when a Svench component has been renamed (hence we have a stale
  // component in the route)
  $: if (!single && $_routes !== lastRoutes) {
    const previous = lastRoutes
    lastRoutes = $_routes
    if (previous !== null) {
      router.run()
    }
    prefetchWhenIdle($_routes, isCurrentRoutes)
  }

  // --- tree ---

  // const tree = derived(routes$, x => x.tree)
  const tree = {
    subscribe: run => routes$.subscribe(x => run(x.tree)),
  }

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

  // --- search ---

  const search = writable({ query: '' })

  // --- commands ---

  const commands = createCommands({ options, router })

  // --- context ---

  setContext({
    busy,

    raw,
    naked,
    options,
    commands,
    makeNamer,
    router: {
      listen: router.listen,
      resolve: (...args) => router.resolve(...args),
      findRoute: (...args) => router.findRoute(...args),
      current: router.current,
      error: router.error,
    },
    routes: _routes,
    //   route$,
    //   meta,
    tree,

    extras,

    search,

    Fallback,
  })

  onDestroy(router.listen())

  $: if (fixBodyStyle) {
    document.body.classList.add('svench-body')
  } else {
    document.body.classList.remove('svench-body')
  }
</script>

{#if $options.enabled}
  <UiResolver
    shadow={$options.shadow}
    {ui}
    {lightUi}
    {shadowUi}
    let:current={{ App, error, shadow, css }}
  >
    {#if single}
      <Router {scrollNav} bind:focus />
    {:else if !shadow || css}
      <AppContext {focus} {shadow} {App} {error} {css} {setScrollTarget}>
        <Router {scrollNav} bind:focus />
      </AppContext>
    {/if}
  </UiResolver>
{:else}
  <svelte:component this={fallback} />
{/if}

<style>
  :global(body.svench-body) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
</style>
