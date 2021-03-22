import fs from 'fs'
import path from 'path'

export const isSveltePlugin = x =>
  (x && x.name === 'svelte') || /\bvite-plugin-svelte\b/.test(x.name)

export const loadSvelteConfig = async cwd => {
  const filenames = [
    'svelte.config.js',
    'svelte.config.cjs',
    'svelte.config.mjs',
  ]
  for (const filename of filenames) {
    const file = path.resolve(cwd, filename)
    if (!fs.existsSync(file)) continue
    const { default: config } = await import(file)
    return config
  }
}

export const mergeSvelteOptions = (...opts) => Object.assign({}, ...opts)
