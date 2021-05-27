#!/usr/bin/env node

/* eslint-env node */

import { dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import resolve from 'resolve'

const __dirname = dirname(fileURLToPath(import.meta.url))

// see: https://github.com/rixo/svench/issues/30
export const importAbsolute = async file => await import(pathToFileURL(file))

const lookup = (module, basedir) => {
  try {
    return resolve.sync(module, {
      basedir,
      preserveSymlinks: true,
    })
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') return false
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  }
}

const cliBin = 'svench/cli.bin.js'

const projectSvench = lookup(cliBin, process.cwd())

const svenchPath = projectSvench || lookup(cliBin, __dirname)

// NOTE we don't want to set STANDALONE if we use local project's Svench
if (!projectSvench) {
  process.env.SVENCH_STANDALONE = __dirname
}

importAbsolute(svenchPath).catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(2)
})

// import 'svench/cli.bin.js'
