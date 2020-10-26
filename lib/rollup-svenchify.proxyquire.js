const proxyquire = require('proxyquire')

const wrap = (wrapSvelteConfig, modulePath, forceSvelteHot) => {
  const plugin = config => {
    const sveltePluginName = forceSvelteHot
      ? 'rollup-plugin-svelte-hot'
      : modulePath
    const sveltePlugin = require(sveltePluginName)
    return sveltePlugin(wrapSvelteConfig(config))
  }
  plugin._IS_SVENCH_WRAPPED = true
  return {
    [modulePath]: plugin,
  }
}

module.exports = (wrapSvelteConfig, file, forceSvelteHot) => {
  return proxyquire(file, {
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte', forceSvelteHot),
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte-hot', forceSvelteHot),
  })
}
