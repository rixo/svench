const proxyquire = require('proxyquire')
const relative = require('require-relative')

const wrap = (
  wrapSvelteConfig,
  modulePath,
  { forceSvelteHot, sveltePlugin: forceSveltePlugin, Log }
) => {
  const plugin = config => {
    const sveltePluginName = forceSveltePlugin
      ? forceSveltePlugin
      : forceSvelteHot && modulePath === 'rollup-plugin-svelte'
      ? 'rollup-plugin-svelte-hot'
      : modulePath
    if (sveltePluginName === modulePath) {
      Log.info('Reuse svelte plugin: %s', modulePath)
    } else {
      Log.info('Replace svelte plugin: %s => %s', modulePath, sveltePluginName)
    }
    const sveltePlugin = relative(sveltePluginName, process.cwd())
    const wrappedConfig = wrapSvelteConfig(config)
    return sveltePlugin(wrappedConfig)
  }
  plugin._IS_SVENCH_WRAPPED = true
  return {
    [modulePath]: plugin,
  }
}

module.exports = (wrapSvelteConfig, file, opts) => {
  return proxyquire(file, {
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte', opts),
    ...wrap(wrapSvelteConfig, 'rollup-plugin-svelte-hot', opts),
    ...wrap(wrapSvelteConfig, '@svitejs/vite-plugin-svelte', opts),
    ...wrap(wrapSvelteConfig, '@sveltejs/vite-plugin-svelte', opts),
  })
}
