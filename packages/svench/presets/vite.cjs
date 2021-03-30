/**
 * Preset for Vite (default Svelte template) apps.
 */

const path = require('path')

const mergeOptimizeDeps = (...sources) => {
  sources = sources.filter(Boolean)

  const flatFilterMap = mapper => sources.map(mapper).filter(Boolean).flat()

  return {
    entries: flatFilterMap(src => src.entries),
    include: flatFilterMap(src => src.include),
    exclude: flatFilterMap(src => src.exclude),
  }
}

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
    optimizeDeps: mergeOptimizeDeps(a.optimizeDeps, b.optimizeDeps),
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
  post: ({ svenchPath, svenchDir, manifestDir, distDir, port, raw, prod }) => ({
    vite: {
      root: svenchDir,
      server: { port },
      build: { outDir: distDir },
      // when using precompiled, we must prevent Vite from optimizing the Svench
      // bundle because it will put a duplicated Svelte runtime in there -- I
      // surmise there's special optimize treatment for .svelte in Vite
      optimizeDeps: !raw && { exclude: ['svench'] },
      resolve: {
        alias: [
          // --raw, --prod
          !raw &&
            svenchPath && {
              find: /^svench(?:\/index.js)?$/,
              replacement: svenchPath + `/index.${prod ? 'prod' : 'dev'}.js`,
            },
          // /@svench/* alias (from HTML)
          { find: /^\/@svench\//, replacement: manifestDir + '/' },
        ].filter(Boolean),
      },
    },
  }),
}

// for svench-vite
const maybeStandalone = {
  post: ({ standalone, svenchPath, sveltePath }) =>
    standalone && {
      vite: {
        resolve: {
          alias: [
            // NOTE need to be able to resolve svench/* from anywhere, even a
            // directory with no node_modules at all (for npx svench-vite)
            svenchPath && { find: /^svench\//, replacement: svenchPath + '/' },
            sveltePath && {
              find: /^svelte($|\/)/,
              replacement: sveltePath + '$1',
            },
          ].filter(Boolean),
        },
      },
    },
}

module.exports = [viteOption, viteConfig, viteDefaults, maybeStandalone]

Object.assign(module.exports, { viteOption })
