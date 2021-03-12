/**
 * Preset for Vite (default Svelte template) apps.
 */

import path from 'path'

// TODO test that we don't eat user's aliases
const mergeAlias = (...sources) =>
  sources
    .map(alias =>
      !alias
        ? []
        : Array.isArray(alias)
        ? alias
        : Object.entries(alias).map(([find, replacement]) => ({
            find,
            replacement,
          }))
    )
    .flat()

const viteSubConfigs = [
  'resolve',
  'css',
  'json',
  'server',
  'build',
  'optimizeDeps',
  'ssr',
]

const mergeViteConfig = (a = {}, b = {}) => {
  const merged = {
    ...a,
    ...b,
    ...Object.fromEntries(
      viteSubConfigs
        .map(sub => [sub, { ...a[sub], ...b[sub] }])
        .filter(([, v]) => Object.keys(v).length > 0)
    ),
  }
  merged.resolve = {
    ...merged.resolve,
    alias: mergeAlias(
      a.resolve && a.resolve.alias,
      b.resolve && b.resolve.alias
    ),
  }
  return merged
}

const viteDefaults = {
  transform: ({
    manifestDir = 'src',
    publicDir = manifestDir,

    entryUrl = '/@svench/svench.js',

    index = true,
    manifest = true,
    write = true,
  }) => ({
    publicDir,
    manifestDir,
    entryUrl,
    index,
    manifest: manifest && { css: true },
    write,
    vite: {
      clearScreen: false,
    },
  }),

  post: ({
    cwd,
    svenchDir,
    entryFile,
    baseUrl,
    entryUrl,
    indexFileName,
    index,
  }) => {
    const writeIndex = !index
      ? false
      : index.write === true
      ? path.join(svenchDir, indexFileName)
      : typeof index.write === 'string'
      ? path.resolve(cwd, index.write)
      : false

    if (entryUrl === true && typeof writeIndex === 'string') {
      const dir = path.dirname(writeIndex)
      entryUrl = baseUrl + path.relative(dir, entryFile)
    }

    return {
      entryUrl,
      index: index && {
        ...index,
        write: writeIndex,
      },
    }
  },
}

export const viteOption = {
  merge: ({ vite: a } = {}, { vite: b } = {}) => ({
    vite: mergeViteConfig(a, b),
  }),
  cast: ({ vite = {} }) => ({ vite }),
}

const viteConfig = {
  post: ({ svenchDir, manifestDir, distDir, port }) => ({
    vite: {
      root: svenchDir,
      server: { port },
      build: { outDir: distDir },
      // /@svench/* alias
      resolve: {
        alias: [{ find: /^\/@svench\//, replacement: manifestDir + '/' }],
      },
    },
  }),
}

export default [viteOption, viteConfig, viteDefaults]
