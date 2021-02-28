/**
 * Logging: quick and dirty
 */

import { inspect } from 'util'
import * as path from 'path'

const Log = Object.create(console)

const noop = () => {}

// NOTE values must remain contiguous, because we apply log level this way:
//
//     Log.setLevel(Log.LOG + verbosity)
//
Log.MUTE = 0
Log.ERROR = 1
Log.WARN = 2
Log.LOG = 3
Log.INFO = 4
Log.DEBUG = 5

const defaultLevel = Log[process.env.LOG] || Log.LOG
const minLevel = 0
const maxLevel = Log.DEBUG

const levelMethods = {
  [Log.ERROR]: 'error',
  [Log.WARN]: 'warn',
  [Log.LOG]: 'log',
  [Log.INFO]: 'info',
  [Log.DEBUG]: 'debug',
}

Log.cwd = process.cwd()
Log.prefix = 'svench'

const wrap = fn =>
  function(...args) {
    const { cwd } = Log
    let msg = args.shift()
    if (typeof msg === 'string') {
      let i = 0
      msg = msg.replace(/\%(s\*|[oOdisf]|rp)/g, match => {
        if (match === '%rp' || match === '%s*') {
          args[i] = args[i] && path.relative(cwd, args[i])
          i++
          return '%s'
        } else {
          i++
          return match
        }
      })
    }
    if (this.prefix) {
      msg = `[${this.prefix}] ${msg}`
    }
    return fn(msg, ...args)
  }

Log.isEnabled = level => Log[levelMethods[level]] !== noop

Log.inspect = (...args) => {
  const x = args.pop()
  // eslint-disable-next-line no-console
  console.log(...args, inspect(x, { depth: 999, colors: process.stdout.isTTY }))
}

Log.setLevel = level => {
  Object.entries(levelMethods).forEach(([lvl, method]) => {
    if (level < lvl) {
      Log[method] = noop
    } else {
      // eslint-disable-next-line no-console
      Log[method] = wrap(console[method])
    }
  })
}

Log.getLogger = function getLogger(name) {
  const logger = Object.create(this)
  logger.parent = this
  logger.prefix = name
  return logger
}

const countArg = arg =>
  !arg ? 0 : Array.isArray(arg) ? arg.filter(Boolean).length : 1

const minMax = (min, max, x) => Math.max(min, Math.min(max, x))

// cast -vvv like values to level
const verboseToLevel = (verbose, quiet) =>
  minMax(minLevel, maxLevel, defaultLevel + countArg(verbose) - countArg(quiet))

Log.setVerbosity = (verbose, quiet) =>
  Log.setLevel(verboseToLevel(verbose, quiet))

Log.setLevel(defaultLevel)

export default Log
