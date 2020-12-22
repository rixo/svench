/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */

import { writable } from 'svelte/store'

export default (hot, routes) => {
  const hotData = (hot && hot.data) || {}

  const routes$ = hotData.routes || writable([])

  routes$.set(routes)

  if (hot) {
    hot.dispose((data = hot.data) => {
      data.routes = routes$
    })
    // stop the update bubble
    hot.accept()
  }

  return routes$
}
