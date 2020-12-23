/**
 * Preset for Snowpack apps.
 */

module.exports = ({
  svelte,
  manifest = true,
  override,
  index,
  ...options
}) => ({
  svelte: svelte !== false && {
    css: true, // force CSS in JS with Snowpack
    ...svelte,
  },

  override: override !== false && {
    mount: true, // auto mount
    ...override,
  },

  manifest: manifest && {
    css: true,
    ...manifest,
  },

  index: index !== false && {
    write: true,
    ...index,
  },

  ...options,
})
