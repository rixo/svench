/* eslint-disable no-console */

process.env.SVENCH = process.env.SVENCH == null ? '1' : process.env.SVENCH

const fs = require('fs')
const path = require('path')
const relative = require('require-relative')
const sade = require('sade')

const pkg = require('../package.json')

const findup = (from, target) => {
  let last = null
  let cur = from
  while (cur !== last) {
    const file = path.resolve(cur, target)
    if (fs.existsSync(file)) {
      return file
    }
    last = cur
    cur = path.dirname(cur)
  }
  throw new Error(`Could not find ${target} from ${from} and upper`)
}

const run = async ({ cwd = process.cwd(), config: overrides } = {}) => {
  const rel = x => relative(x, cwd)

  const { startDevServer, createConfiguration } = rel('snowpack')
  const { svenchify } = rel('svench/snowpack')

  const defaultConfigFile = path.resolve('snowpack.config.js')

  const original = fs.existsSync(defaultConfigFile)
    ? require(defaultConfigFile)
    : {}

  const svenchified = svenchify(original, {
    enabled: true,
    sveltePlugin: rel('@snowpack/plugin-svelte'),
    presets: [],
    requirePreset: rel,
    ...overrides,
  })

  // TODO what does this function returns??
  const [, config] = createConfiguration(svenchified)

  await startDevServer({ cwd, config })
}

const readConfig = (cwd, configOption) => {
  if (configOption === true) {
    configOption = 'svench.config.js'
  }
  if (typeof configOption === 'string') {
    const file = path.resolve(cwd, configOption)
    if (fs.existsSync(file)) {
      return {
        path: path.relative(cwd, file),
        config: require(file),
      }
    }
  }
  return {}
}

module.exports = argv =>
  new Promise((resolve, reject) => {
    const prog = sade('svench')

    {
      const { action } = prog

      const asyncAction = run => (...args) => {
        run(...args)
          .then(resolve)
          .catch(reject)
      }

      // prog.action = (fn, ...args) => action.call(prog, asyncAction(fn), ...args)
      prog.action = (fn, ...args) => {
        if (typeof fn === 'string') {
          return action.call(
            prog,
            asyncAction((...args) => {
              const _fn = require(`./commands/${fn}.js`)
              return _fn(...args)
            }),
            ...args
          )
        } else {
          return action.call(prog, asyncAction(fn), ...args)
        }
      }
    }

    return (
      prog
        .version(pkg.version)
        .option('--preset, -p', 'Preset')
        .option('--config, -c', 'Use Svench config file', true)
        .option('--snowpack', 'Use Snowpack, optionally specify a config file')
        .command('dev [dir]', 'Run dev server (default dir ./src)', {
          default: true,
        })
        .action(async dir => {
          await run({ config: { dir } })
        })
        .command('debug [dir]', 'Print debug info')
        .option('--load-config, --load, -l', 'Load config contents', false)
        // .action(require('./commands/debug.js'))
        .action('debug')
        .parse(argv)
    )
  })
