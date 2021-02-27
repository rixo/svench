import * as path from 'path'

import { pipe } from './util.js'
import { parseOptions } from './config.js'

const PROXYQUIRE_MODULE = '../lib/svenchify.proxyquire.cjs'
const REQUIRE_MODULE = '../lib/svenchify.require.cjs'

const defaultSvelteExtensions = ['.svelte']

const mergeExtensions = (...sources) => [
  ...new Set(
    sources
      .flat()
      .filter(Boolean)
      .map(x => path.extname(x) || x)
  ),
]

const mergePreprocessors = (...sources) => sources.flat().filter(Boolean)

export const parseSvenchifyOptions = ({
  noMagic = false,
  interceptSveltePlugin = !noMagic,
  esm = !noMagic,

  // force resolving Svelte plugin to rollup-plugin-svelte-hot with Svench,
  // even if it is rollup-plugin-svelte that is required in the config file
  //
  // allows using HMR with Svench only
  //
  // 2020-12-22 stop forcing, instead hoping for svelte-hmr to be integrated
  // into rollup-plugin-svelte (using rixo/rollup-plugin-svelte#svelte-hmr for
  // now)
  //
  forceSvelteHot = false,

  svelte,

  ...svench
} = {}) => ({
  svench: parseOptions(svench),

  svelte: {
    // css: css => {
    //   css.write('.svench/dist/bundle.css')
    // },
    // emitCss: false,
    hot: true, // TODO hmm :-/
    ...svelte,
  },

  noMagic,
  interceptSveltePlugin,
  esm,
  forceSvelteHot,
})

export default (
  transformSvenchifyOptions,
  createPluginParts,
  customizeConfig,
  finalizeConfig
) => {
  const doSvenchify = async (
    source,
    transform,
    {
      noMagic = false,
      interceptSveltePlugin = !noMagic,
      esm = !noMagic,
      svelte,
      svench,
      svench: { extensions },
      forceSvelteHot,
    }
  ) => {
    process.env.SVENCH = process.env.SVENCH || true

    const importConfig = wrapSvelteConfig => async source => {
      if (typeof source === 'string') {
        const file = path.resolve(source)
        if (interceptSveltePlugin) {
          if (esm) {
            const _require = require('esm')(module)
            const loadConfigFile = _require(PROXYQUIRE_MODULE)
            const m = loadConfigFile(wrapSvelteConfig, file, forceSvelteHot)
            return m.default
          } else {
            const loadConfigFile = require(PROXYQUIRE_MODULE)
            return loadConfigFile(wrapSvelteConfig, file, forceSvelteHot)
          }
        } else {
          if (esm) {
            const _require = require('esm')(module)
            // NOTE this should be the following, but esm fails to rewrite some
            // imports (`import { svenchify } from 'svench/rollup'`, especially)
            //     return require(file).default
            const requireFile = _require(REQUIRE_MODULE)
            return requireFile(file).default
          } else {
            return require(file)
          }
        }
      }
      return source
    }

    const getConfig = async (...args) => {
      let preprocessors

      const wrapSvelteConfig = config => {
        preprocessors = mergePreprocessors(config.preprocess, svelte.preprocess)
        return {
          ...config,
          ...svelte,
          extensions:
            svelte.extensions ||
            mergeExtensions(
              config.extensions || defaultSvelteExtensions,
              extensions
            ),
          preprocess: {
            markup: (...args) => parts.preprocess.pull(...args),
          },
        }
      }

      const castConfig = async source => {
        const resolved = await source
        if (typeof resolved === 'function') {
          return castConfig(resolved(...args))
        }
        return resolved
      }

      const loadConfig = pipe(importConfig(wrapSvelteConfig), castConfig)

      let config = await loadConfig(source)

      // === Config loaded (preprocess initialized) ===

      const parts = createPluginParts({ preprocessors, ...svench })

      if (transform) {
        config = await transform(config)
      }

      config = customizeConfig(config, parts, { wrapSvelteConfig })

      return config
    }

    return getConfig
  }

  const parseOptions = pipe(transformSvenchifyOptions, parseSvenchifyOptions)

  // API:
  //
  //     svenchify('rollup.config.js', {...svenchifyOptions})
  //
  //     svenchify(configPath, transform = identity, {...svenchifyOptions})
  //     eg. svenchify('rollup.config.js', x => x.client, {...svenchifyOptions})
  //
  const parseSvenchifyArgs = args =>
    args.length === 2 ? [args[0], null, args[1]] : args

  const svenchify = (...args) => {
    const [source, transform, options = {}] = parseSvenchifyArgs(args)
    const svenchifyOptions = parseOptions(options)
    if (options._setOptions) {
      options._setOptions(svenchifyOptions.svench)
    }
    const getConfig = doSvenchify(source, transform, svenchifyOptions)
    return finalizeConfig(getConfig, svenchifyOptions)
  }

  return svenchify
}
