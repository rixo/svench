import { Log } from '../lib.js'
import { inspect } from '../inspect.cjs'

const debug = async options => {
  const info = await inspect(options)

  Log.inspect(info)

  if (info.missingDeps.length > 0) {
    Log.warn(`\n(!) Missing dependencies: ${info.missingDeps.join(', ')}\n`)
  }
}

export default debug
