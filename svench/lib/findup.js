import * as fs from 'fs'
import * as path from 'path'

export default (from, target) => {
  let last = null
  let cur = from
  while (cur !== last) {
    const file = path.resolve(cur, target)
    if (fs.existsSync(file)) {
      return file
    }
    last = cur
    cur = path.dirname(cur)
  }
  throw new Error(`Could not find ${target} from ${from} and upper`)
}
