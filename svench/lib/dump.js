/**
 * Debug dump util.
 */

import Log from './log.js'

const get = (o, path) => {
  if (!path) return o
  return path.slice(1).reduce((cur, step) => cur && cur[step], o)
}

const dumpAt = (o, path) => {
  const x = get(o, path)
  Log.inspect(x)
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
    if (dump.startsWith(key + '.')) dumpAt(o, dump.split('.'))
  }
  return o
}
