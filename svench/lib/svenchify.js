import * as path from 'path'

import { pipe } from './util.js'
import { resolveOptions } from './config.js'
import { createPluginParts } from './plugin-shared.js'

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

const parseSvenchifyOptions = ({
  noMagic = false,
  interceptSveltePlugin = !noMagic,
  esm = !noMagic,
  _setOptions,
  ...svench
} = {}) => ({
  svench: resolveOptions(svench),
  noMagic,
  interceptSveltePlugin,
  esm,
  _setOptions,
})

export default (defaultPresets, customizeConfig, finalizeConfig) => {
  const doSvenchify = async (
    source,
    transform,
    {
      noMagic = false,
      interceptSveltePlugin = !noMagic,
      esm = !noMagic,
      svench,
      svench: { svelte = {}, extensions },
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
    const { _setOptions, ...svenchifyOptions } = parseSvenchifyOptions({
      presets: defaultPresets,
      ...options,
    })
    if (_setOptions) {
      _setOptions(svenchifyOptions.svench)
    }
    const getConfig = doSvenchify(source, transform, svenchifyOptions)
    return finalizeConfig(getConfig, svenchifyOptions)
  }

  return svenchify
}
