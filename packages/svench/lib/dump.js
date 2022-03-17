/**
 * Debug dump util.
 */

import Log from './log.js'

const isDefined = x => typeof x !== 'undefined'

const getCollapsedValue = (cur, key, collapse, parent) => {
  if (!cur) return
  if (isDefined(cur[key])) return cur[key]
  if (!collapse) return
  if (collapse[parent] == null) return
  const collapsedNode = cur[collapse[parent]]
  if (!collapsedNode) return
  return collapsedNode[key]
}

const getWithCollapse = (collapse, o, path) => {
  if (!path) return o
  let parent
  return path.reduce((cur, step) => {
    const value = cur && getCollapsedValue(cur, step, collapse, parent)
    parent = step
    return value
  }, o)
}

export const dumpAt = (o, path, collapse) => {
  if (typeof path === 'string') path = path.split('.')
  const x = getWithCollapse(collapse, o, path)
  if (typeof x === 'string') {
    // eslint-disable-next-line no-console
    console.log(x)
  } else {
    Log.inspect(x)
  }
  process.exit()
}

export const maybeDump = (...args) => {
  const [key, dump, o] = args
  if (args.length === 2) {
    return o => maybeDump(key, dump, o)
  }
  if (!dump) return
  if (Array.isArray(key)) {
    for (const k of key) {
      maybeDump(k, dump, o)
    }
  } else {
    if (dump === key) dumpAt(o)
    if (dump.startsWith(key + '.')) dumpAt(o, dump.split('.').slice(1))
  }
  return o
}
