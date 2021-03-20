#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */

import 'trace'

import { sep } from 'path'
import chain from 'stack-chain'

import run from './cli/cli.js'

const ver = process.versions.node
const majorVer = parseInt(ver.split('.')[0], 10)

if (majorVer < 14) {
  console.error(
    `Node version ${ver} is not supported, please use Node.js 14.0 or higher.`
  )
  process.exit(1)
}

// TODO dev specific options
{
  Error.stackTraceLimit = 100

  const esmFile = ['', 'esm', 'esm.js'].join(sep)

  chain.filter.attach((error, frames) =>
    frames.filter(callSite => {
      if (!callSite) return false
      const name = callSite.getFileName()
      if (!name) return false
      return (
        name.includes(sep) &&
        !name.startsWith('internal') &&
        !name.endsWith(esmFile)
      )
    })
  )
}

process.env.SVENCH = true
// needed to skip nolluprc
process.env.SVENCH_CLI = process.env.SVENCH_CLI || true

run(process.argv).catch(err => {
  console.error((err && err.stack) || err)
  process.exit(1)
})
