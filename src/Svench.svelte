<script>
  import { onDestroy } from 'svelte'
  import { writable, derived } from 'svelte/store'
  import { setContext, makeNamer, noop } from './util.js'
  import { createStores, route } from './stores.js'
  import { augmentRoutes } from './routify/index.js'
  // import test from './test.js'
  import SvenchInner from './SvenchInner.svelte'

  // import { Router, route } from '@sveltech/routify'

  export let localStorageKey = 'Svench'

  let inputRoutes
  export { inputRoutes as routes$ }

  export let fixed = true

  export let defaults

  const { options, routes, register, destroy } = createStores()

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
    ...readStoredOptions(),
    ...readParamsOptions(),
  }

  // --- local state (query params) ---

  const updateState = opts => {
    if (localStorageKey && window.localStorage) {
      const values = Object.fromEntries(
        localOptions.map(name => [name, opts[name]])
      )
      localStorage.setItem(localStorageKey, JSON.stringify(values))
    }

    console.log('updateState', history._replaceState)
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

  // $: $route, updateState($options)

  // --- augmented routes ---

  $: $routes = augmentRoutes($inputRoutes.routes)

  // --- getRenderName ---

  const getRenderName = makeNamer(() => $options)

  // --- view ---

  // const getView = () => new URLSearchParams(window.location.search).get('view')
  //
  // const view = writable()
  // const focus = writable(false)
  //
  // const _disposers = []
  // const disposer = {
  //   set _(v) {
  //     _disposers.push(v)
  //     return true
  //   }
  // }
  // const call = fn => fn()
  // onDestroy(() => _disposers.forEach(call))
  //
  // $: $view = $route$, getView() || true
  // $: $focus = $view !== true

  // --- route ---

  const route$ = route

  // const route$ = writable()
  // const route$ = writable()

  // bug?
  // $: $route$ = $route
  // disposer._ = route.subscribe(v => {
  //   // if (v === $route$) return
  //   // console.log('route', v)
  //   // $route$ = v
  //   // $view = getView() || true
  //   // if ($focus !== $view !== true) {
  //   //   $focus = $view !== true
  //   // }
  // })

  // --- tree ---

  const tree = derived(inputRoutes, x => x.tree)

  // --- meta ---

  const meta = writable()

  // $: $meta = $route && $route.meta

  // --- test ---

  // $: test($pages)

  // --- context ---

  setContext({
    options,
    routes,
    route$,
    // meta,
    findRoute: ({ path }) => $routes.find(x => x.path === path),
    tree,
    register,
    getRenderName,
    // render: view,
    // focus,
  })

  onDestroy(destroy)

  const x = writable(0)
  const xx = setInterval(() => {
    $x++
  }, 1000)
  $: console.log('x', $x)
  onDestroy(() => {
    clearInterval(xx)
  })

  // setTimeout(() => {
  //   debugger
  //   $route = []
  // }, 500)
</script>

{#if $tree}
  <SvenchInner {routes} />
{/if}
