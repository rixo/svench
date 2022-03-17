import fs from 'fs'
import path from 'path'

import { importDefaultAbsolute } from './util.js'

export const isSveltePlugin = x =>
  (x && x.name === 'svelte') || /\bvite-plugin-svelte\b/.test(x.name)

export const findSvelteConfig = async (cwd, loadConfig = true) => {
  const filenames = [
    'svelte.config.js',
    'svelte.config.cjs',
    'svelte.config.mjs',
  ]
  for (const filename of filenames) {
    const file = path.resolve(cwd, filename)
    if (!fs.existsSync(file)) continue
    const result = { path: file, exists: true }
    if (loadConfig) {
      try {
        result.value = await importDefaultAbsolute(file)
      } catch (err) {
        result.error = String(err)
      }
    }
    return result
  }
  return { exists: false }
}

export const loadSvelteConfig = async cwd =>
  (await findSvelteConfig(cwd))?.value

export const mergeSvelteOptions = (...opts) => Object.assign({}, ...opts)
