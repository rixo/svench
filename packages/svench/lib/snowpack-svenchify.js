/**
 *     import { svenchify } from 'svench/snowpack'
 *
 *     module.exports = svenchify('snowpack.config.js', {
 *       ...
 *     })
 */

const isSveltePlugin = x =>
  Array.isArray(x) ? isSveltePlugin(x[0]) : x === '@snowpack/plugin-svelte'

const wrapSveltePlugin = (x, options) => {
  const [sveltePlugin, opts] = Array.isArray(x) ? x : [x, {}]
  return ['svench/snowpack', { sveltePlugin, ...opts, svench: options }]
}

const resolveConfig = config =>
  typeof config === 'string' ? require(config) : config

export default (config, options) => {
  config = resolveConfig(config)

  const svenchOptions = {
    enabled: true,
    ...options,
  }

  return {
    ...config,

    install: [...config.install, 'svench'],

    plugins: config.plugins.map(x =>
      isSveltePlugin(x) ? wrapSveltePlugin(x, svenchOptions) : x
    ),
  }
}
