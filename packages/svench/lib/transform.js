import { isSveltePlugin } from './ecosystem.js'

const INJECTED = Symbol('SVENCH OPTIONS INJECTED')

export default ({ extensions, routix, enforce }) => options => {
  if (options[INJECTED]) return

  options[INJECTED] = true

  const plugins = options.plugins.filter(Boolean)

  const svelteIndex = plugins.findIndex(isSveltePlugin)

  if (svelteIndex === -1) {
    throw new Error('Failed to find Svelte plugin')
  }

  const afterSvelte = {
    name: 'svench:after',
    enforce,
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) return null

      const match = /\bexport\s+default\s+([^\s;]+)/.exec(code)

      if (!match) throw new Error('Failed to find default export')

      const item = routix.get(id)

      code += `;${match[1]}.$$svench_id = ${JSON.stringify(item.id)};`

      return { code, map: null }
    },
  }

  // options.plugins = [beforeSvelte, ...options.plugins, afterSvelte]
  options.plugins = [
    // beforeSvelte,
    ...plugins.slice(0, svelteIndex + 1),
    afterSvelte,
    ...plugins.slice(svelteIndex + 1),
  ]

  return options
}
