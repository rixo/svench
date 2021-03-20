/**
 * Preset for Vite (default Svelte template) apps.
 */

const path = require('path')
const os = require('os')
const { stringHashcode } = require('../lib/util.js')

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

const viteOption = {
  merge: ({ vite: a } = {}, { vite: b } = {}) => ({
    vite: mergeViteConfig(a, b),
  }),
  cast: ({ vite = {} }) => ({ vite }),
}

// const index = resolve.sync('svench', { basedir: process.env.SVENCH_CLI })
// const dir = path.dirname(findup(index, 'package.json'))
// console.log(dir)
// process.exit()

const viteConfig = {
  post: ({
    svenchPath,
    sveltePath,
    svenchDir,
    manifestDir,
    distDir,
    port,
  }) => ({
    vite: {
      root: svenchDir,
      server: { port },
      build: { outDir: distDir },
      // /@svench/* alias
      resolve: {
        alias: [
          { find: /^\/@svench\//, replacement: manifestDir + '/' },
          // TODO move that where it belongs!
          svenchPath && { find: /^svench\//, replacement: svenchPath + '/' },
          sveltePath && {
            find: /^svelte($|\/)/,
            replacement: sveltePath + '$1',
          },
        ].filter(Boolean),
      },
    },
  }),
}

// for svench-vite
const maybeStandalone = {
  transform: ({ standalone, cwd, dir }) => {
    if (!standalone) return null
    const target = path.resolve(cwd, dir)
    const id = stringHashcode(target)
    const svenchDir = path.join(os.tmpdir(), `svench-${id}`)
    return { svenchDir }
  },

  post: ({ standalone, svenchPath, sveltePath }) => {
    if (!standalone) return null
    return {
      vite: {
        resolve: {
          alias: [
            svenchPath && { find: /^svench\//, replacement: svenchPath + '/' },
            sveltePath && {
              find: /^svelte($|\/)/,
              replacement: sveltePath + '$1',
            },
          ].filter(Boolean),
        },
      },
    }
  },
}

module.exports = [viteOption, viteConfig, viteDefaults, maybeStandalone]
