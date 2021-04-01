/**
 * Preset for Snowpack apps.
 */

export default [
  ({ svelte, snowpack = true, manifest = true, index = true, ...options }) => ({
    svelte: svelte !== false && {
      css: true, // force CSS in JS with Snowpack
      ...svelte,
    },

    snowpack: snowpack && {
      mount: true, // auto mount
      ...snowpack,
    },

    manifest: manifest && {
      css: true,
      ...manifest,
    },

    index: index && {
      write: true,
      ...index,
    },

    ...options,
  }),
  {
    post: ({ svenchDir }) => {
      if (!svenchDir) {
        throw new Error('svenchDir option is required with Snowpack')
      }
    },
  },
]
