import * as path from 'path'
import { createRoutix } from 'routix/esm'

import { parseOptions } from './config'
import cachingPreprocess from './caching-preprocess'
import routixParser from './routix-parser'

export const createPluginUtils = arg => {
  const options = parseOptions(arg)

  const {
    enabled,
    manifestDir,
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

  const routix = createRoutix({
    merged: true,
    write: {
      routes: path.resolve(manifestDir, 'routes.js'),
      // extras: path.resolve(root, 'tmp/extras.js'),
    },
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
