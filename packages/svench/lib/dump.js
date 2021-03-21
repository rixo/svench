/**
 * Debug dump util.
 */

import Log from './log.js'

const get = (o, path) => {
  if (!path) return o
  return path.reduce((cur, step) => cur && cur[step], o)
}

export const dumpAt = (o, path) => {
  if (typeof path === 'string') path = path.split('.')
  const x = get(o, path)
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
