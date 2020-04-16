import { writable } from 'svelte/store'
import navaid from 'navaid'
import DirectoryPage from './app/DirectoryPage.svelte'

export default getRoutes => {
  // const {currentRoute } = getContext()
  let currentRoute = null
  let currentView = null
  let current

  const on404 = () => {
    const route = getRoutes().dirs.find(isCurrentLocation)
    const current = { route }
    if (route) {
      current.page = DirectoryPage
    }
    setCurrent(current)
  }

  const router = navaid('/', on404)

  router.error = writable()
  router.current = writable()

  const isCurrentLocation = x => x.path === location.pathname

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
    const route = find(location.pathname, view == null, routes)
    if (route) loadComponent(route, view)
    else on404()
  })

  router.listen()

  return router
}
