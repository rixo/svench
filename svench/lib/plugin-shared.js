import * as fs from 'fs'
import * as path from 'path'
import { createRoutix } from 'routix'

import Log from './log.js'
import { SVENCH_CONFIG_FILE } from './const.js'
import { parseOptions } from './config.js'
import cachingPreprocess from './caching-preprocess.js'
import routixParser from './routix-parser.js'
import { mkdirpSync } from './util.js'

const loadSvenchConfig = () => {
  const svenchConfig = path.resolve(SVENCH_CONFIG_FILE)
  if (!fs.existsSync(svenchConfig)) return {}
  // FIXME here's something ESM is not gonna love :/
  return require.main.require(svenchConfig)
}

export const createPluginParts = argOptions => {
  const options = parseOptions({ ...loadSvenchConfig(), ...argOptions })

  const {
    enabled,
    svenchDir,
    manifestDir,
    routesFile,
    resolveRouteImport,
    // preprocess: preprocessors,
    mdsvex,
    md,
    autoComponentIndex,
    autoSections,
    extensions,
  } = options

  if (!enabled) return { options }

  const preprocessors =
    options.preprocess || (options.svelte && options.svelte.preprocess)

  const preprocess = cachingPreprocess({
    extensions,
    preprocessors,
    mdsvex,
    md,
  })

  if (svenchDir) mkdirpSync(svenchDir)
  if (manifestDir) mkdirpSync(manifestDir)

  const routix = createRoutix({
    log: Log.getLogger('routix'),
    merged: true,
    write: {
      routes: path.resolve(routesFile),
      // extras: path.resolve(root, 'tmp/extras.js'),
    },
    resolve: resolveRouteImport,
    ...options,
    ...routixParser({
      preprocess: preprocess.push,
      autoComponentIndex,
      autoSections,
    }),
  })

  return {
    options,
    preprocess,
    routix,
  }
}
