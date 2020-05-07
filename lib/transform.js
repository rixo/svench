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

      // removing <svench:options/> tags
      if (item && item.hasOptions) {
        // taking a risk here, but we can't use the tag in code snippets (in
        // Svench components with Mdsvex, for example) if we remove all of them;
        // since the tag is allowed only once, let's just hope the real one is
        // the first
        code = code.replace(/<svench:options\s+.*?\/>/, match =>
          ' '.repeat(match.length)
        )
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
