/**
 * Behold, the almighty Svench cli!
 */

process.env.SVENCH = process.env.SVENCH == null ? '1' : process.env.SVENCH

import * as fs from 'fs'
import * as path from 'path'
import cac from 'cac'

import { Log, loadSvenchConfig } from './lib.js'
import { inspect } from './inspect.cjs'

const normalizeDir = dirs => (dirs.length === 1 ? dirs[0] : dirs)

const normalizeOptions = (
  { cwd },

  [
    dir,
    {
      _: dirs = [],
      verbose,
      quiet,
      v, // eslint-disable-line no-unused-vars
      q, // eslint-disable-line no-unused-vars
      ...rest
    },
  ]
) => ({
  cwd,
  dir: normalizeDir([dir, ...dirs]),
  verbose,
  quiet,
  ...rest,
})

const readPkg = async () => {
  const contents = await fs.promises.readFile(
    path.resolve(__dirname, '../package.json'),
    'utf8'
  )
  return JSON.parse(contents)
}

const autodetect = command => async options => {
  const info = await inspect(options)
  const { favorite: tool } = info
  if (!tool) {
    throw new Error('Failed to detect underlying tooling')
  }
  let baseTool = tool
  if (tool === 'nollup') {
    baseTool = 'rollup'
    options = { ...options, _nollup: true }
  }
  const cmd = `./commands/${baseTool}/${command}.js`
  Log.debug('Load command %s', cmd)
  const { default: handler } = await import(cmd)
  return handler(info, options)
}

export default async argv => {
  let resolve, reject

  const done = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const pkg = await readPkg()
  const cwd = process.cwd()

  const asyncAction = (run, args) => {
    const opts = {
      ...loadSvenchConfig(cwd),
      ...normalizeOptions({ cwd }, args),
    }

    // configure log level as soon as possible
    Log.setVerbosity(opts.verbose, opts.quiet)

    Promise.resolve(run)
      .then(run => run(opts))
      .then(resolve)
      .catch(reject)
  }

  const resolveCommand = cmd =>
    typeof cmd === 'string'
      ? async (...args) => {
          const { default: _fn } = await import(`./commands/${cmd}.js`)
          return _fn(...args)
        }
      : cmd

  const handle = cmd => (...args) => {
    const commandHandler = resolveCommand(cmd)
    asyncAction(commandHandler, args)
  }

  const prog = cac('svench')
    // preset
    .option('-p, --preset', 'Preset')
    // config file
    .option('-c, --config [config]', 'Use Svench config file', true)
    // flavor
    .option('--vite [config]', 'Use Vite')
    .option('--snowpack [config]', 'Use Snowpack')
    .option('--nollup [config]', 'Use Nollup')
    .option('--rollup [config]', 'Use Rollup')
    .option('--nocfg, --noconfig', "Don't try to load tool specific config")
    // debugging
    .option('-v, --verbose', 'Increase verbosity (can be repeated -vv)')
    .option('-q, --quiet', 'Increase quietness (can be repeated -qq)')
    .option('--dump <item>', 'Dump for debug (options|config)')
    // info
    .version(pkg.version, '-V, --version')
    .help()

  // svench dev
  prog
    .command('[dir]', 'Run dev server (default dir ./src)', {
      default: true,
    })
    .alias('dev')
    .option(
      '--plugin, --svelte-plugin <plugin>',
      'Specify name of the Svelte plugin to use'
    )
    .option('--reload', 'Clear local cache (Snowpack only)')
    .action(handle(autodetect('dev')))

  // svench debug
  prog
    .command(
      'inspect [dir]',
      'Report about detected tooling (mainly for debug purpose)'
    )
    .option('--load-config, --load, -l', 'Load config contents', false)
    .action(handle('inspect'))

  prog.parse(argv)

  return done
}
