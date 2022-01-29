/**
 * Entry service: creates a Svench entry point.
 *
 * @todo theme option
 */

import path, { basename } from 'path'
import fs from 'fs'
import dedent from 'dedent'

import Log from './log.js'
import { maybeDump } from './dump.js'

const quote = x => JSON.stringify(x)

const hotDotJs = x => x.replace(/(\.js)?$/, '.hot$1')

const doWriteManifest = (
  writeFile,
  {
    cwd,
    typescript,
    dir,
    dump,
    entryFile,
    routesFile,
    manifest: { encoding = 'utf8', ui, css, options },
  }
) => {
  const routesFileName = basename(routesFile)
  const hotRoutesFilename = hotDotJs(routesFileName)
  const hotRoutesFile = hotDotJs(routesFile)

  // --- user's src/.svench.js ---

  const findOptionsFileUrl = () => {
    if (typescript) {
      for (const file of ['.svench.ts', '.svench.ts']) {
        const optionsFile = path.join(sourceDir, file)
        if (fs.existsSync(optionsFile)) {
          return optionsFile.replace(/\.(?:ts|js)$/, '')
        }
      }
    } else {
      const optionsFile = path.join(sourceDir, '.svench.js')
      if (fs.existsSync(optionsFile)) {
        return optionsFile
      }
    }
  }

  const sourceDir = path.resolve(cwd, dir)
  const optionsUrl = findOptionsFileUrl()

  // --- svench.js ---

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
    optionsUrl &&
      dedent`
        import * as rc from ${quote(optionsUrl)}
        options.rc = rc
      `,
    '',
    // NOTE the export prevents a "empty facade module" warning with Rollup
    'export default start(options, document.body, import.meta.hot)',
    '',
    '// Some tools (e.g. Vite, Snowpack) do static code analysis and need',
    '// to see this to enable HMR',
    'if (false) import.meta.hot.accept()',
  ]
    .filter(x => x !== false)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')

  maybeDump('entry', dump, code)

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

  maybeDump('routes.hot', dump, hotRoutesCode)

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
