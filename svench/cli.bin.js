#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */

const ver = process.versions.node
const majorVer = parseInt(ver.split('.')[0], 10)

if (majorVer < 10) {
  console.error(
    'Node version ' +
      ver +
      ' is not supported, please use Node.js 10.0 or higher.'
  )
  process.exit(1)
}

// TODO dev specific options
{
  const chain = require('stack-chain')
  const { sep } = require('path')

  require('trace')

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
process.env.SVENCH_CLI = true

// eslint-disable-next-line no-global-assign
require = require('esm')(module)

const { default: run } = require('./cli/cli.js')

run(process.argv).catch(err => {
  console.error((err && err.stack) || err)
  process.exit(1)
})
