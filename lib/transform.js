const INJECTED = Symbol('SVENCH OPTIONS INJECTED')

export default ({ extensions, $$ }) => options => {
  if (options[INJECTED]) return

  options[INJECTED] = true

  const svelteIndex = options.plugins.findIndex(({ name }) =>
    /^svelte\b/.test(name)
  )

  if (svelteIndex === -1) {
    throw new Error('Failed to find Svelte plugin')
  }

  const beforeSvelte = {
    name: 'svench:before',
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) return null

      const item = $$.get(id)

      if (item && item.optionsNode) {
        const { start, end } = item.optionsNode
        code =
          code.slice(0, start) +
          code.slice(start, end).replace(/\S/g, ' ') +
          code.slice(end)
        return { code, map: null }
      }

      return null
    },
  }

  const afterSvelte = {
    name: 'svench:after',
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) return null

      const match = /\bexport\s+default\s+([^\s;]+)/.exec(code)

      if (!match) throw new Error('Failed to find default export')

      const item = $$.get(id)

      code += `;${match[1]}.$$svench_id = ${JSON.stringify(item.id)};`

      return { code, map: null }
    },
  }

  // options.plugins = [beforeSvelte, ...options.plugins, afterSvelte]
  options.plugins = [
    beforeSvelte,
    ...options.plugins.slice(0, svelteIndex + 1),
    afterSvelte,
    ...options.plugins.slice(svelteIndex + 1),
  ]

  return options
}
