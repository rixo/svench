/**
 * Entry service: creates a Svench entry point.
 *
 * @todo theme option
 */

import { basename } from 'path'
import fs from 'fs'
import dedent from 'dedent'

import Log from './log.js'

const quote = x => JSON.stringify(x)

const hotDotJs = x => x.replace(/(\.js)?$/, '.hot$1')

const doWriteManifest = (
  writeFile,
  {
    entryFile,
    routesFile,
    manifest: { encoding = 'utf8', ui, css, options, optionsFile },
  }
) => {
  const routesFileName = basename(routesFile)
  const hotRoutesFilename = hotDotJs(routesFileName)
  const hotRoutesFile = hotDotJs(routesFile)

  const code = [
    'import { start } from "svench"',
    '',
    (css === true || css === 'css') &&
      dedent`
        import "svench/themes/default.css"
        import "svench/themes/default-markdown.css"
      `,
    css === 'js' &&
      dedent`
        import "svench/themes/default.css.js"
        import "svench/themes/default-markdown.css.js"
      `,
    '',
    'const options = {}',
    '',
    dedent`
      import routes from "./${hotRoutesFilename}"
      options.routes = routes
    `,
    '',
    ui &&
      dedent`
        import * as ui from ${quote(ui)}
        options.ui = ui
      `,
    '',
    options && `Object.assign(options, ${JSON.stringify(options, false, 2)})`,
    '',
    optionsFile &&
      dedent`
        import config from ${quote(optionsFile)}
        Object.assign(options, config)
      `,
    '',
    'start(options, import.meta.hot)',
    '',
    '// Some tools (e.g. Vite, Snowpack) do static code analysis and need',
    '// to see this to enable HMR',
    'if (false) import.meta.hot.accept()',
  ]
    .filter(x => x !== false)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')

  writeFile(entryFile, code, encoding)

  // --- routes.hot.js ---

  const hotRoutesCode = dedent`
    /**
     * We're putting the generated routes in their own module and export a store,
     * this way we can easily hot reload the routes only (without rerendering the
     * whole app for nothing).
     */
    import { hotRoutes } from "svench"

    import * as routes from "./${routesFileName}"

    export default hotRoutes(import.meta.hot, routes)

    // Some tools (e.g. Vite, Snowpack) do static code analysis and need
    // to see this to enable HMR
    if (false) import.meta.hot.accept()
  `

  writeFile(hotRoutesFile, hotRoutesCode, encoding)
}

export const writeManifest = async options => {
  const promises = []

  const writeFile = (file, ...args) => {
    promises.push(
      fs.promises.writeFile(file, ...args).then(() => {
        Log.info('Written: %s*', file)
      })
    )
  }

  doWriteManifest(writeFile, options)

  await Promise.all(promises)
}

export const writeManifestSync = options => {
  const writeFile = (file, ...args) => {
    fs.writeFileSync(file, ...args)
    Log.info('Written: %s*', file)
  }
  doWriteManifest(writeFile, options)
}
