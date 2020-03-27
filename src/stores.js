import { writable, readable } from 'svelte/store'
import { registerRoutes } from './register.js'

const PAGE = Symbol('Svench.PAGE')
const INDEX = Symbol('Svench.INDEX')

const sorter = (a, b) =>
  (a.sortKey || a.segment).localeCompare(b.sortKey || b.segment)

const toTreeArray = (tree, base = '') => {
  const entries = Object.entries(tree)
  if (entries.length < 1) {
    return undefined
  }
  return entries
    .filter(([segment]) => segment !== 'index')
    .map(([segment, childrenTree]) => {
      const id = base + '/' + segment
      const children = toTreeArray(childrenTree, id)
      const isPage = !!childrenTree[PAGE]
      const sortKey = segment.replace(/_/g, ' ')
      const node = {
        title: sortKey.replace(/^[\d-]+ /, ''),
        sortKey,
        path: id,
        ...(childrenTree[INDEX] || childrenTree[PAGE]),
        id,
        isDirectory: !(childrenTree[PAGE] || childrenTree[INDEX]),
        isPage,
        segment,
        children,
      }
      if (childrenTree[INDEX] && childrenTree[PAGE]) {
        node.registerTarget = childrenTree[PAGE]
      }
      return node
    })
    .sort(sorter)
}

const toTree = pages => {
  const tree = {}
  for (const page of Object.values(pages).filter(Boolean)) {
    const steps = page.shortPath.split('/').filter(Boolean)
    let last = steps.pop()
    let isComponentIndex = false
    if (last === 'index' && steps.length > 0) {
      isComponentIndex = true
      last = steps.pop()
    }
    if (!last) continue
    let cursor = tree
    for (const step of steps) {
      if (!cursor[step]) {
        cursor[step] = {}
      }
      cursor = cursor[step]
    }
    const target = isComponentIndex || page.isIndex ? INDEX : PAGE
    cursor[last] = {
      ...cursor[last],
      [target]: page,
    }
  }
  return toTreeArray(tree)
}

const buffer = (delay, callback) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => callback(...args), delay)
  }
}

export const createStores = () => {
  const options = writable({})

  const routes = writable([])

  const { pages, register, destroy } = registerRoutes(routes, options)

  // debounced derived
  const tree = readable([], set =>
    pages.subscribe(
      buffer(20, p => {
        set(toTree(p))
      })
    )
  )

  return { options, routes, pages, tree, register, destroy }
}
