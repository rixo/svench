/**
 *     import { svenchify } from 'svench/snowpack'
 *
 *     module.exports = svenchify('snowpack.config.js', {
 *       ...
 *     })
 */
import { SNOWPACK_PLUGIN } from './const.js'

const isSveltePlugin = x =>
  Array.isArray(x) ? isSveltePlugin(x[0]) : x === '@snowpack/plugin-svelte'

const wrapSveltePlugin = options => plugin => {
  if (!isSveltePlugin(plugin)) return plugin
  const [sveltePlugin, opts] = Array.isArray(plugin) ? plugin : [plugin, {}]
  return [SNOWPACK_PLUGIN, { sveltePlugin, ...opts, svench: options }]
}

export default (snowpackConfig, svenchOptions = true) => {
  const enabled =
    svenchOptions === true || (svenchOptions && svenchOptions.enabled)

  if (!enabled) return snowpackConfig

  return {
    ...snowpackConfig,
    plugins: snowpackConfig.plugins.map(
      wrapSveltePlugin({ enabled, ...svenchOptions })
    ),
  }
}
