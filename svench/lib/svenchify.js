import * as path from 'path'

import { pipe, isRollupV1 } from './util.js'
import { parseSvenchifyOptions } from './rollup-options.js'

const SVENCH = Symbol('Svench')

const PROXYQUIRE_MODULE = './lib/rollup-svenchify.proxyquire.js'
const REQUIRE_MODULE = './lib/rollup-svenchify.require.js'

const defaultSvelteExtensions = ['.svelte']

const mergeExtensions = (...sources) => [
  ...new Set(
    sources
      .flat()
      .filter(Boolean)
      .map(x => path.extname(x) || x)
  ),
]

const mergePreprocess = (...sources) => sources.flat().filter(Boolean)

export default SvenchPlugin => {
  const _svenchify = async (
    source,
    transform,
    {
      noMagic = false,
      interceptSveltePlugin = !noMagic,
      esm = !noMagic,
      configFunction = !isRollupV1(),
      svelte,
      svench,
      svench: { extensions, isNollup },
      forceSvelteHot,
    }
  ) => {
    process.env.SVENCH = process.env.SVENCH || 1

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
      let preprocess

      const preprocessor = {
        markup: (...args) => $.preprocess.markup(...args),
      }

      const wrapSvelteConfig = config => {
        preprocess = mergePreprocess(config.preprocess, svelte.preprocess)
        return {
          ...config,
          ...svelte,
          extensions:
            svelte.extensions ||
            mergeExtensions(
              config.extensions || defaultSvelteExtensions,
              extensions
            ),
          preprocess: preprocessor,
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

      if (transform) {
        config = await transform(config)
      }

      // NOTE this is not functionnaly necessary because this work is done by
      // the plugin anyway, however this helps with Rollup logs, or someone
      // dumping svenchified config for debug purpose
      if (svench.override) {
        const { override } = svench
        if (override.input) {
          config.input = override.input
        }
        if (override.output) {
          config.output = override.output
        }
      }

      if (!config.plugins) {
        throw new Error('A Svelte plugin is required in your Rollup config')
      }

      config.plugins = config.plugins.filter(Boolean).map(x => {
        if (!x[SVENCH]) return x
        const {
          [SVENCH]: { plugin, config },
        } = x
        return plugin(wrapSvelteConfig(config))
      })

      const { $, ...svenchPlugin } = SvenchPlugin({ preprocess, ...svench })

      config.plugins.unshift(svenchPlugin)

      return config
    }

    return configFunction && !isNollup ? getConfig : getConfig()
  }

  // API:
  //     svenchify('rollup.config.js', {...svenchifyOptions})
  //     svenchify('rollup.config.js', x => x.client, {...svenchifyOptions})
  const svenchify = (source, transform, options) =>
    typeof transform === 'function'
      ? _svenchify(source, transform, parseSvenchifyOptions(options))
      : _svenchify(source, null, parseSvenchifyOptions(transform || options))

  svenchify.svelte = (plugin, config) => {
    // avoid double wrapping
    if (plugin._IS_SVENCH_WRAPPED) return plugin(config)
    // try to avoid creating an useless instance (to avoid double warnings)
    // NOTE check process.env.SVENCH just in time
    const hooks = process.env.SVENCH ? {} : plugin(config)
    hooks[SVENCH] = { plugin, config }
    return hooks
  }

  return svenchify
}
