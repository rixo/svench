import { writable } from 'svelte/store'
import navaid from 'navaid'
import DirectoryPage from './app/DirectoryPage.svelte'

export default ({ base = '/', getRoutes }) => {
  // const {currentRoute } = getContext()
  let currentRoute = null
  let currentView = null
  let current

  const on404 = () => {
    const pathname = router.format(location.pathname)
    const route = getRoutes().dirs.find(x => x.path === pathname)
    const current = { route }
    if (route) {
      current.cmp = DirectoryPage
    }
    setCurrent(current)
  }

  const router = navaid(base, on404)

  base = '/' + base.replace(/^\/|\/$/g, '') + '/'

  router.resolve = uri => {
    if (!uri) return uri
    uri = base + uri.replace(/^\/|\/$/g, '')
    return uri
  }

  router.error = writable()
  router.current = writable()

  const getView = () => new URLSearchParams(window.location.search).get('view')

  const setCurrent = x => {
    current = x
    router.current.set(x)
  }

  const setError = x => {
    router.error.set(x)
  }

  const loadComponent = async (_route, _view) => {
    try {
      currentRoute = _route
      currentView = _view

      const { default: cmp } = await _route.import()

      // we've been superseeded while loading
      if (currentRoute !== _route || currentView !== _view) return

      const next = { cmp, route: currentRoute, view: getView() }
      if (
        !current ||
        current.cmp !== next.cmp ||
        current.route !== next.route ||
        current.view !== next.view
      ) {
        setCurrent(next)
      }
      setError(null)
    } catch (err) {
      if (currentRoute !== _route) return
      setError(err)
    }
  }

  const find = (path, indexFirst, routes) => {
    let actual = null
    for (const route of routes) {
      if (indexFirst && path + '/index' === route.path) return route
      if (path === route.path) {
        if (!indexFirst) return route
        actual = route
      }
    }
    return actual
  }

  router.on('*', () => {
    const view = getView()
    const routes = getRoutes()
    const route = find(router.format(location.pathname), view == null, routes)

    if (route) loadComponent(route, view)
    else on404()

    // onMatch: for fallback
    if (router.onMatch) router.onMatch()
  })

  const listen = router.listen

  router.listen = () => {
    listen()
    return () => router.unlisten()
  }

  return router
}
