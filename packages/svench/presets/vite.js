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

  post: ({
    cwd,
    svenchDir,
    entryFile,
    baseUrl,
    entryUrl,
    indexFileName,
    index,
    ...options
  }) => {
    const writeIndex = !index
      ? false
      : index.write === true
      ? path.join(svenchDir, indexFileName)
      : typeof index.write === 'string'
      ? path.resolve(cwd, index.write)
      : false

    if (entryUrl === true && typeof writeIndex === 'string') {
      const dir = path.dirname(writeIndex)
      entryUrl = baseUrl + path.relative(dir, entryFile)
    }

    return {
      ...options,
      cwd,
      svenchDir,
      entryFile,
      entryUrl,
      index: index && {
        ...index,
        write: writeIndex,
      },
    }
  },
}
