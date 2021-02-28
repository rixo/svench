import Color from 'color-js'

export const isDark = color => {
  if (!color) return null
  if (String(color).startsWith('@')) return null
  return Color(color).getLuminance() <= 0.5
}
