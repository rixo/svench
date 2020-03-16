import { writable, readable } from 'svelte/store'

const PAGE = Symbol('Svench.PAGE')
const INDEX = Symbol('Svench.INDEX')

const compare = ({ segment: a }, { segment: b }) =>
  a === b ? 0 : a < b ? -1 : 1

const sorter = (a, b) =>
  a.isDirectory && b.isDirectory
    ? compare(a, b)
    : a.isDirectory
    ? -1
    : b.isDirectory
    ? 1
    : compare(a, b)

const toTreeArray = (tree, base = '') =>
  Object.entries(tree)
    .map(([segment, children]) => {
      if (children[PAGE]) {
        return children[PAGE]
      } else {
        const id = base + '/' + segment
        return {
          ...children[INDEX],
          id,
          isDirectory: true,
          segment,
          children: toTreeArray(children, id),
        }
      }
    })
    .sort(sorter)

const toTree = pages => {
  const tree = {}
  for (const page of Object.values(pages).filter(Boolean)) {
    const steps = page.shortPath
      .replace('_', ' ')
      .replace('.', '/')
      .split('/')
      .filter(Boolean)
    const last = steps.pop()
    if (!last) continue
    let cursor = tree
    for (const step of steps) {
      if (!cursor[step]) {
        cursor[step] = {}
      }
      cursor = cursor[step]
    }
    const target = page.isIndex ? INDEX : PAGE
    // cursor[last] = { ...cursor[last], [target]: { ...page, segment: last } }
    cursor[last] = {
      ...cursor[last],
      // page: !page.isIndex,
      // index: !!page.isIndex,
      [target]: { ...page, segment: last },
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

  const pages = writable({})

  // debounced derived
  const tree = readable([], set =>
    pages.subscribe(
      buffer(20, p => {
        set(toTree(p))
      })
    )
  )

  return { options, routes, pages, tree }
}
