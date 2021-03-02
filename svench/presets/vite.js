/**
 * Preset for Vite (default Svelte template) apps.
 */

import path from 'path'

export default {
  transform: ({
    manifestDir = 'src',
    publicDir = manifestDir,

    index = true,
    manifest = true,
    write = true,

    vite,

    ...options
  }) => ({
    publicDir,
    manifestDir,

    index,
    manifest,
    write,

    vite: {
      clearScreen: false,
      server: {
        port: 4242,
      },
      ...vite,
    },

    ...options,
  }),

  post: ({ svenchDir, indexFileName, index, ...options }) => ({
    ...options,
    svenchDir,
    index: index && {
      ...index,
      write:
        index.write === true
          ? path.join(svenchDir, indexFileName)
          : index.write,
    },
  }),
}
