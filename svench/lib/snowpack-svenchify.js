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
  const [sveltePlugin, svelte] = Array.isArray(plugin) ? plugin : [plugin, {}]
  return [SNOWPACK_PLUGIN, { sveltePlugin, svelte, ...options }]
}

export default (snowpackConfig, svenchifyOptions = true) => {
  const enabled =
    svenchifyOptions === true || (svenchifyOptions && svenchifyOptions.enabled)

  if (!enabled) return snowpackConfig

  return {
    ...snowpackConfig,
    plugins: snowpackConfig.plugins.map(
      wrapSveltePlugin({ enabled, ...svenchifyOptions })
    ),
  }
}
