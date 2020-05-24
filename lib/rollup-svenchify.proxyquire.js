const proxyquire = require('proxyquire')

const wrap = (wrapSvelteConfig, modulePath) => {
  const plugin = config => {
    const sveltePlugin = require(modulePath)
    return sveltePlugin(wrapSvelteConfig(config))
  }
  plugin._IS_SVENCH_WRAPPED = true
  return {
    [modulePath]: plugin,
  }
}

module.exports = (wrapSvelteConfig, file) =>
  proxyquire(file, {
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte'),
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte-hot'),
  })
