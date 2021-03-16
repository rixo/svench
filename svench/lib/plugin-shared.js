import * as fs from 'fs'
import * as path from 'path'
import { createRoutix } from 'routix'

import Log from './log.js'
import { SVENCH_CONFIG_FILE } from './const.js'
import { parseSvenchOptions } from './config.js'
import cachingPreprocess from './caching-preprocess.js'
import routixParser from './routix-parser.js'
import { mkdirpSync } from './util.js'
import { importSync } from './import-relative.cjs'

export const loadSvenchConfig = (cwd = process.cwd()) => {
  const svenchConfig = path.resolve(cwd, SVENCH_CONFIG_FILE)
  if (!fs.existsSync(svenchConfig)) return {}
  return importSync(svenchConfig).default
}

export const createPluginParts = argOptions => {
  const options = parseSvenchOptions({ ...loadSvenchConfig(), ...argOptions })

  const {
    enabled,
    svenchDir,
    manifestDir,
    routesFile,
    resolveRouteImport,
    preprocessors = options.svelte && options.svelte.preprocess,
    mdsvex,
    md,
    autoComponentIndex,
    autoSections,
    extensions,
  } = options

  if (!enabled) return { options }

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
