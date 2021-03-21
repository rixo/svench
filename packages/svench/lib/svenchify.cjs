/**
 * Legacy CommonJS svenchifier.
 *
 * TODO proxyquire should probably be dropped
 */

const PROXYQUIRE_MODULE = '../lib/svenchify.proxyquire.cjs'
const REQUIRE_MODULE = '../lib/svenchify.require.cjs'

module.exports = async (
  file,
  {
    interceptSveltePlugin,
    esm,
    wrapSvelteConfig,
    sveltePlugin,
    forceSvelteHot,
    Log,
  }
) => {
  if (interceptSveltePlugin) {
    const loadConfigArgs = [
      wrapSvelteConfig,
      file,
      { sveltePlugin, forceSvelteHot, Log },
    ]
    if (esm) {
      const _require = require('esm')(module)
      const loadConfigFile = _require(PROXYQUIRE_MODULE)
      const m = loadConfigFile(...loadConfigArgs)
      // NOTE even if esm option is enabled (and it's enabled by default),
      //      we don't know whether we'll actually be importing an ESM or
      //      CJS file... hence default || module
      return m.default || m
    } else {
      const loadConfigFile = require(PROXYQUIRE_MODULE)
      return loadConfigFile(...loadConfigArgs)
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
