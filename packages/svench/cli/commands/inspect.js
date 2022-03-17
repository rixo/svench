import { Log, maybeDump, dumpAt, inspect } from '../lib.js'

export default async options => {
  const { dump, inspect: inspectItem } = options

  maybeDump('options', dump, options)

  const info = await inspect(options)

  if (inspectItem) {
    dumpAt(info, inspectItem, { config: 'value' })
  }

  Log.inspect(info)

  if (info.missingDeps && info.missingDeps.length > 0) {
    Log.warn(`\n(!) Missing dependencies: ${info.missingDeps.join(', ')}\n`)
  }
}
