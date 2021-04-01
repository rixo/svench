/**
 * Libraries that need to be bundled with Svench, either because ESM support is
 * too defaillant.
 */

import Color from 'color-js'

export const isDark = color => {
  if (!color) return null
  if (String(color).startsWith('@')) return null
  return Color(color).getLuminance() <= 0.5
}

/**
 * Fuzzysort is published in weird UMD that Vite manages to do nothing with.
 */
export { default as fuzzysort } from 'fuzzysort'
