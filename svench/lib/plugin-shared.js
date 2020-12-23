import * as path from 'path'
import { createRoutix } from 'routix'

import { parseOptions } from './config.js'
import cachingPreprocess from './caching-preprocess.js'
import routixParser from './routix-parser.js'
import { mkdirpSync } from './util.js'

export const createPluginParts = arg => {
  const options = parseOptions(arg)

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
