import { derived } from 'svelte/store'
import { fuzzysort } from './util-esm.js'

import { noop } from './util.js'

const longer = (a, b) => {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return b.length > a.length ? b : a
}

const bySortKey = ({ route: a }, { route: b }) => {
  // TODO path should be sliced?
  const ak = a.sortKey || a.path
  const bk = b.sortKey || b.path
  const diff = ak.localeCompare(bk)
  if (diff !== 0) return diff
  if (!a.view || !b.view) return 0
  const ai = a.views.indexOf(a.view)
  const bi = b.views.indexOf(b.view)
  return ai - bi
}

export default ({ routes, router, maxResults = 10 }) => {
  const current = {
    query: '',
    results: [],
    open: false,
    hasMore: false,
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
      const { results, hasMore } = getResults()
      Object.assign(current, { results, hasMore })
      update()
    },
    current
  )

  const finalizeResults = results => ({
    results: results.slice(0, maxResults),
    hasMore: results.length > maxResults,
  })

  const getResults = () => {
    const items = []
    for (const route of $routes) {
      const { views, title, path } = route
      const routeItem = {
        route,
        searchKey: [title, path, title].join('✂️'),
      }
      items.push(routeItem)

      if (!views) continue
      for (const view of views) {
        items.push({
          ...routeItem,
          view,
          searchKey: [view, '✂️', path, '?', view].join(''),
        })
      }
    }

    if (!current.query) {
      const results = items
        .filter(({ route }) => route.dir !== '.')
        .sort(bySortKey)
        .slice(0, maxResults + 1)
        .map((obj, index) => {
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
      return finalizeResults(results)
    }

    const results = fuzzysort.go(current.query, items, {
      key: 'searchKey',
      limit: maxResults + 1,
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

    return finalizeResults(formattedResults)
  }

  api.set = value => {
    Object.assign(current, value)
    if (current.query !== lastQuery) {
      selectedIndex = 0
      const { results, hasMore } = getResults()
      Object.assign(current, { results, hasMore })
    }
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
