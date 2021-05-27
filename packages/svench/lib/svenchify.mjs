/**
 * Svenchify load config, ESM flavor.
 *
 * Just replaces instances of Svelte plugins with new instnaces (no stealing of
 * the plugin's options).
 */

import { importAbsolute } from './util.js'
import { isSveltePlugin } from './ecosystem.js'

export default async (
  file,
  { Log, sveltePlugin, createPlugin, svelteOptions }
) => {
  const { default: config } = await importAbsolute(file)

  const replaceSveltePlugins = async ({ plugins = [], ...config } = {}) => ({
    ...config,
    plugins: plugins.map(plugin => {
      if (!isSveltePlugin(plugin)) return plugin
      const replacement = createPlugin(svelteOptions)
      Log.log(
        'Replacing Svelte plugin %s with %s (from %s)',
        plugin.name,
        replacement.name,
        sveltePlugin
      )
      return replacement
    }),
  })

  return await replaceSveltePlugins(config)
}
