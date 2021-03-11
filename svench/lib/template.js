import * as fs from 'fs'
import * as path from 'path'
import CheapWatch from 'cheap-watch'

import { escapeRe, mkdirp } from './util'
import { ENTRY_URL } from './const'
import { parseIndexOptions } from './config'
import Log from './log.js'

export const _template = ({ script }) => () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Svench</title>
    <script type="module" defer src="${script}"></script>
  </head>
  <body />
</html>
`

const watchFile = async (file, callback) => {
  const dir = path.dirname(file)

  const relative = file.slice(dir.length + 1)

  const filter = ({ path }) => path === relative

  const watch = new CheapWatch({ dir, filter })

  watch.on('+', callback)

  watch.on('-', callback)

  await watch.init()

  return watch
}

const _createIndex = async (
  { source, write, encoding, replace },
  { watch, script, onChange, publicDir } = {}
) => {
  const sourceFile = source && path.resolve(source)
  const outputFile =
    write &&
    (write === true
      ? path.resolve(publicDir, 'index.html')
      : path.resolve(write))

  const generate = async () => {
    let contents = sourceFile
      ? await fs.promises.readFile(sourceFile, encoding)
      : _template({ script })()

    if (replace) {
      if (typeof replace === 'function') {
        contents = replace(contents, { entryUrl: script })
      }
      for (const [search, replacement] of [
        ...Object.entries(replace),
        [String(ENTRY_URL), ENTRY_URL],
      ]) {
        contents = contents.replace(
          new RegExp(escapeRe(search), 'g'),
          replacement === ENTRY_URL ? script : replacement
        )
      }
    }

    if (outputFile) {
      const dir = path.dirname(outputFile, { recursive: true })
      await mkdirp(dir)
      await fs.promises.writeFile(outputFile, contents, encoding)
      Log.info('Written: %s*', outputFile)
    }

    return contents
  }

  let contentsPromise = generate()

  if (sourceFile && watch) {
    watchFile(sourceFile, () => {
      contentsPromise = generate()
      if (onChange) {
        contentsPromise.then(onChange)
      }
    })
  }

  if (outputFile) {
    return () => fs.promises.readFile(outputFile, encoding)
  }

  return () => contentsPromise
}

export const createIndex = (opts, ...args) =>
  _createIndex(parseIndexOptions(opts), ...args)
