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

const run = require('./cli/cli.js')

run(process.argv).catch(err => {
  console.error((err && err.stack) || err)
  process.exit(1)
})
