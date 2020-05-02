import { writable } from 'svelte/store'
import navaid from './navaid.js'

export default ({ base = '/', getRoutes, DefaultIndex, Fallback }) => {
  let currentRoute = null
  let currentView = null
  let current

  const on404 = path => {
    if (path === '/' || path === '/index') {
      setCurrent({ cmp: DefaultIndex })
    } else {
      setCurrent(null)
    }
  }

  const router = navaid(base, on404)

  base = '/' + base.replace(/^\/|\/$/g, '') + '/'

  router.resolve = uri => {
    if (!uri) return uri
    uri = base + uri.replace(/^\/|\/$/g, '')
    uri = uri.replace(/\/+/g, '/')
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

  const loadDir = route => {
    setCurrent({ route, fallback: true, cmp: Fallback })
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

  router.findRoute = href => {
    const view = getView()
    const routes = getRoutes()
    const url = new URL(href)
    const path = router.format(url.pathname)
    const route = find(path.replace(/^\/$/, ''), view == null, routes)
    return route
  }

  router.on('*', () => {
    const view = getView()
    const routes = getRoutes()
    const path = router.format(location.pathname)
    const route = find(path.replace(/^\/$/, ''), view == null, routes)

    if (route) {
      if (route.import) loadComponent(route, view)
      else loadDir(route)
    } else {
      on404(path)
    }

    // onMatch: for fallback
    if (router.onMatch) router.onMatch()
  })

  const listen = router.listen

  router.listen = el => {
    listen(el)
    return () => router.unlisten()
  }

  return router
}
