#!/usr/bin/env node

/* eslint-env node */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import resolve from 'resolve'

const __dirname = dirname(fileURLToPath(import.meta.url))

const lookup = (module, basedir) => {
  try {
    return resolve.sync(module, {
      basedir,
      preserveSymlinks: true,
    })
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      // eslint-disable-next-line no-console
      console.error(err)
      process.exit(1)
    }
  }
}

const cliBin = 'svench/cli.bin.js'

const svenchPath = lookup(cliBin, process.cwd()) || lookup(cliBin, __dirname)

process.env.SVENCH_STANDALONE = __dirname

import(svenchPath).catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(2)
})

// import 'svench/cli.bin.js'
