import { derived } from 'svelte/store'
import { fuzzysort } from './util-esm.js'

import { noop } from './util.js'

const longer = (a, b) => {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return b.length > a.length ? b : a
}

const byRoutePath = ({ route: a }, { route: b }) => {
  // TODO path should be sliced?
  const ak = a.path
  const bk = b.path
  let diff = ak.localeCompare(bk)
  if (diff !== 0) return diff
  if (!a.view || !b.view) return 0
  const ai = a.views.indexOf(a.view)
  const bi = b.views.indexOf(b.view)
  diff = ai - bi
  if (diff !== 0) return diff
  const ah = (a.headings || []).indexOf(a.heading)
  const bh = (b.headings || []).indexOf(b.heading)
  diff = ah - bh
  return diff
}

export default ({ routes, router, maxResults = 500 }) => {
  const current = {
    query: '',
    results: [],
    open: false,
    hasMore: false,
    // initially true because activated by first key stroke
    preventScroll: true,
  }

  let selectedIndex = 0
  let lastQuery = ''

  let $routes
  let set = noop

  const api = derived(
    routes,
    (_$routes, _set) => {
      $routes = _$routes
      set = _set
      const { results, hasMore } = getResults()
      Object.assign(current, { results, hasMore })
      update()
    },
    current
  )

  const update = () =>
    set({
      ...current,
      selectedIndex,
    })

  const finalizeResults = results => {
    const knownHref = new Set()
    return {
      results: results
        .slice(0, maxResults)
        .map(({ 0: titleResult, 1: pathResult, obj }, index) => {
          const { route, path, title, view, hash } = obj
          // const [titleA, path, titleB] = searchKey.split('✂️')
          const href = router.resolveView(route.path, view, hash)

          if (knownHref.has(href)) return
          knownHref.add(href)

          const highTitle = titleResult
            ? fuzzysort.highlight(titleResult)
            : title
          const highPath = pathResult ? fuzzysort.highlight(pathResult) : path
          return {
            index,
            score: 0,
            selected: index === current.selected,
            title: highTitle,
            path: highPath,
            route,
            href,
          }
        })
        .filter(Boolean),
      hasMore: results.length > maxResults,
    }
  }

  const getResults = () => {
    const items = []
    for (const route of $routes) {
      if (route.path === '.') continue
      if (route.path === '/_') continue

      const { views, title, path, headings = [] } = route
      const displayPath = path.replace(/^\/_\//, '/')
      const routeItem = {
        route,
        // searchKey: [title, displayPath, title].join('✂️'),
        title,
        path: displayPath,
      }
      items.push(routeItem)

      if (!views) continue
      for (const view of views) {
        items.push({
          ...routeItem,
          view,
          title: '? ' + view,
          path: `${displayPath} ? ${view}`,
        })
      }

      for (const heading of headings) {
        const { id, level, hierarchy } = heading
        // can't link to headings with no id
        if (!id) continue
        items.push({
          ...routeItem,
          heading,
          hash: id,
          title: `${'#'.repeat(level)} ${heading.text}`,
          path: `${displayPath} # ${hierarchy.join(' > ')}`,
        })
      }
    }

    if (!current.query) {
      const results = items
        .sort(byRoutePath)
        .slice(0, maxResults + 1)
        .map(obj => ({ obj }))
      return finalizeResults(results)
    }

    const results = fuzzysort.go(current.query, items, {
      keys: ['title', 'path'],
      limit: maxResults + 1,
      threshold: -999,
      scoreFn: ([title, path]) => {
        let score = 0
        if (!title && !path) return -1000
        if (title) score += title.score
        if (path) score += path.score * 1.5
        return score
      },
    })

    return finalizeResults(results)
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

  const updateSelected = (preventScroll = false) => {
    current.preventScroll = preventScroll
    current.results.map((result, i) => {
      result.selected = i === selectedIndex
    })
    update()
  }

  current.selectUp = () => {
    const n = current.results.length
    selectedIndex = (n + selectedIndex - 1) % n
    updateSelected()
  }

  current.selectDown = () => {
    selectedIndex = (selectedIndex + 1) % current.results.length
    updateSelected()
  }

  current.setSelectedIndex = (index, preventScroll = false) => {
    selectedIndex = index
    updateSelected(preventScroll)
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
