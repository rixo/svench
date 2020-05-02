import * as fs from 'fs'
import * as path from 'path'
import CheapWatch from 'cheap-watch'

import { escapeRe } from './util'
import { ENTRY_URL } from './const'

export const _template = ({ script }) => () => `
<!DOCTYPE html />
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Svench</title>

    <!-- <link rel="icon" type="image/png" href="/favicon.png" /> -->
    <!-- <link rel="stylesheet" href="/global.css" /> -->
    <!-- <link rel="stylesheet" href="/build/bundle.css" /> -->

    <script type="module" defer src="${script}">

    </script>
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

export default async (opt, { watch, script, onChange }) => {
  if (!opt) return

  const { source, write, encoding = 'utf8', replace = {} } = opt

  const sourceFile = source && path.resolve(source)
  const outputFile = write && path.resolve(write)

  const generate = async () => {
    let contents = sourceFile
      ? await fs.promises.readFile(sourceFile, encoding)
      : _template({ script })

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

    if (outputFile) await fs.promises.writeFile(outputFile, contents, encoding)

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
