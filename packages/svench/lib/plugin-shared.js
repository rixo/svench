import * as fs from 'fs'
import * as path from 'path'
import { createRoutix } from 'routix'

import Log from './log.js'
import { SVENCH_CONFIG_FILE } from './const.js'
import { parseSvenchOptions } from './config.js'
import cachingPreprocess from './caching-preprocess.js'
import routixParser from './routix-parser.js'
import { mkdirpSync, importAbsolute } from './util.js'

export const loadSvenchConfig = async (cwd = process.cwd()) => {
  const candidateFilenames = [
    SVENCH_CONFIG_FILE,
    SVENCH_CONFIG_FILE.replace(/\.js$/, '.mjs'),
    SVENCH_CONFIG_FILE.replace(/\.js$/, '.cjs'),
  ]
  for (const filename of candidateFilenames) {
    const configFile = path.resolve(cwd, filename)
    if (fs.existsSync(configFile)) {
      return (await importAbsolute(configFile)).default
    }
  }
  return {}
}

export const createPluginParts = argOptions => {
  const options = parseSvenchOptions(argOptions)

  const {
    cwd,
    svelteCompiler,
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
    keepTitleExtensions,
    extensions,
  } = options

  if (!enabled) return { options }

  const preprocess = cachingPreprocess({
    cwd,
    svelteCompiler,
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
      keepTitleExtensions,
    }),
  })

  return {
    options,
    preprocess,
    routix,
  }
}
