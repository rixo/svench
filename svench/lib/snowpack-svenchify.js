/**
 *     import { svenchify } from 'svench/snowpack'
 *
 *     module.exports = svenchify('snowpack.config.js', {
 *       ...
 *     })
 */

const isSveltePlugin = x =>
  Array.isArray(x) ? isSveltePlugin(x[0]) : x === '@snowpack/plugin-svelte'

const wrapSveltePlugin = options => plugin => {
  if (!isSveltePlugin(plugin)) return plugin
  const [sveltePlugin, opts] = Array.isArray(plugin) ? plugin : [plugin, {}]
  return ['svench/snowpack', { sveltePlugin, ...opts, svench: options }]
}

export default (snowpackConfig, svenchOptions = !!+process.env.SVENCH) => {
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
