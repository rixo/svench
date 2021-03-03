import { derived } from 'svelte/store'
import fuzzysort from 'fuzzysort'

import { noop } from './util.js'

const longer = (a, b) => {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return b.length > a.length ? b : a
}

export default ({ routes, router, maxResults = 10 }) => {
  const current = {
    query: '',
    results: [],
    open: false,
  }

  let selectedIndex = 0
  let lastQuery = ''

  let $routes
  let update = noop

  const api = derived(
    routes,
    (_$routes, set) => {
      $routes = _$routes
      update = () => set(current)
      current.results = getResults()
      update()
    },
    current
  )

  const getResults = () => {
    const items = []
    for (const route of $routes) {
      const { views = [], title, path } = route
      const routeItem = {
        route,
        searchKey: [title, path.replace(/\/[^\/]*$/, '') || '/', title].join(
          '✂️'
        ),
      }
      items.push(routeItem)
      for (const view of views) {
        items.push({
          ...routeItem,
          view,
          searchKey: [view, path, view].join('✂️'),
        })
      }
    }

    if (!current.query) {
      return items.slice(0, maxResults).map((obj, index) => {
        const { route, view, searchKey } = obj
        const [titleA, path, titleB] = searchKey.split('✂️')
        return {
          index,
          score: 0,
          route,
          view,
          selected: index === current.selected,
          href: router.resolveView(route.path, view),
          path,
          title: longer(titleA, titleB),
        }
      })
    }

    const results = fuzzysort.go(current.query, items, {
      key: 'searchKey',
      limit: maxResults,
    })

    const formattedResults = results.map((result, index) => {
      const {
        score,
        obj: { route, view, searchKey },
      } = result
      const h = result ? fuzzysort.highlight(result) : searchKey
      const [titleA, path, titleB] = h.split('✂️')
      return {
        index,
        score,
        route,
        view,
        selected: index === current.selected,
        href: router.resolveView(route.path, view),
        path,
        title: longer(titleA, titleB),
      }
    })

    return formattedResults
  }

  api.set = value => {
    Object.assign(current, value)
    if (current.query !== lastQuery) {
      selectedIndex = 0
      current.results = getResults()
    }
    lastOpen = current.open
    lastQuery = current.query
    updateSelected()
  }

  const updateSelected = () => {
    current.results.map((result, i) => {
      result.selected = i === selectedIndex
    })
    update()
  }

  current.selectUp = () => {
    if (selectedIndex <= 0) return
    selectedIndex = selectedIndex - 1
    updateSelected()
  }

  current.selectDown = () => {
    if (selectedIndex >= current.results.length - 1) return
    selectedIndex = selectedIndex + 1
    updateSelected()
  }

  current.setSelectedIndex = index => {
    selectedIndex = index
    updateSelected()
  }

  current.select = () => {
    if (!current.open) return
    const selected = current.results[selectedIndex]
    current.open = false
    update()
    if (!selected) return
    router.route(selected.href)
  }

  return api
}
