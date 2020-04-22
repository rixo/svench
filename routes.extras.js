/**
 * We're putting the generated routes in their own module and export a store,
 * this way we can easily hot reload the routes only (without rerendering the
 * whole app for nothing).
 */
import { writable } from 'svelte/store'

import extras from './tmp/extras.js'

const hotData = (import.meta.hot && import.meta.hot.data) || {}

const extras$ = hotData.extras || writable([])

extras$.set(extras)

export default extras$

if (import.meta.hot) {
  import.meta.hot.dispose(data => {
    data.extras = extras$
  })
  // stop the update bubble
  import.meta.hot.accept()
}
