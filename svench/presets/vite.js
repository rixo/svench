/**
 * Preset for Vite (default Svelte template) apps.
 */

export default ({
  manifestDir = 'src',
  publicDir = manifestDir,

  index = true,
  manifest = true,
  write = true,

  ...options
}) => ({
  publicDir,
  manifestDir,

  index,
  manifest,
  write,

  ...options,
})
