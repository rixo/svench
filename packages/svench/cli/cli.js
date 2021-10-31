/**
 * Behold, the almighty Svench cli!
 */

process.env.SVENCH = process.env.SVENCH == null ? '1' : process.env.SVENCH

import * as fs from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import cac from 'cac'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { Log, loadSvenchConfig, inspect, ensureRuntime } from './lib.js'

const normalizeDir = dirs => (dirs.length === 1 ? dirs[0] : dirs)

const normalizeGlobalOptions = (
  { cwd },
  {
    verbose,
    quiet,
    v, // eslint-disable-line no-unused-vars
    q, // eslint-disable-line no-unused-vars
    ...rest
  }
) => ({
  cwd,
  verbose,
  quiet,
  ...rest,
})

const normalizeBuildOptions = isBuild => (
  params,
  [dir, { _: dirs = [], ...opts }]
) => ({
  ...normalizeGlobalOptions(params, opts),
  isBuild,
  dir: normalizeDir([dir, ...dirs]),
})

const normalizeInspectOptions = (params, [inspect, opts]) => ({
  ...normalizeGlobalOptions(params, opts),
  inspect,
})

const normalizeCompileOptions = (params, [target, { dev, prod, ...opts }]) => ({
  ...normalizeGlobalOptions(params, opts),
  target,
  prod: dev === true ? false : prod === true ? true : null,
})

const readPkg = async () => {
  const contents = await fs.promises.readFile(
    resolve(__dirname, '../package.json'),
    'utf8'
  )
  return JSON.parse(contents)
}

const ensureRuntimeFor = async (
  prod,
  {
    svench: { version: svenchVersion },
    svelte: { version: svelteVersion, compiler: svelteCompilerPath },
  },
  force
) =>
  await ensureRuntime({
    svenchVersion,
    svelteVersion,
    svelteCompilerPath,
    prod,
    force,
  })

const detectToolAndEnsureRuntime = command => async options => {
  const info = await inspect(options)

  const { favorite: tool } = info
  if (!tool) {
    throw new Error('Failed to autodetect project tooling')
  }
  let baseTool = tool
  if (tool === 'nollup') {
    baseTool = 'rollup'
    options = { ...options, _nollup: true }
  }
  const cmd = `./commands/${baseTool}/${command}.js`
  Log.debug('Load command %s', cmd)
  const { default: handler } = await import(cmd)

  if (options.raw) {
    Log.info('Skip compiling runtime because running raw')
  } else {
    const prod = options.prod || command === 'build'
    await ensureRuntimeFor(prod, info, options.recompile)
  }

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

  const resolveCommand = cmd =>
    typeof cmd === 'string'
      ? async (...args) => {
          const { default: _fn } = await import(`./commands/${cmd}.js`)
          return _fn(...args)
        }
      : cmd

  const asyncAction = async (run, args, parser) => {
    const opts = parser({ cwd }, args)

    const userConfig = await loadSvenchConfig(cwd)

    // configure log level as soon as possible
    Log.setVerbosity(
      opts.verbose || userConfig.verbose,
      opts.quiet || userConfig.quiet
    )

    const _run = await run

    opts.userConfig = userConfig

    await _run(opts)
  }

  const handle = (cmd, normalizer) => (...args) => {
    Promise.resolve(resolveCommand(cmd))
      .then(run => asyncAction(run, args, normalizer))
      .then(resolve)
      .catch(reject)
  }

  const prog = cac('svench')
    // preset
    .option('-p, --preset', 'Preset')
    // .option('--kit', 'Enable SvelteKit specific support', { default: true })
    // config file
    .option('-c, --config [config]', 'Use Svench config file')
    // flavor
    .option('--vite [config]', 'Use Vite')
    .option('--snowpack [config]', 'Use Snowpack')
    .option('--nollup [config]', 'Use Nollup')
    .option('--rollup [config]', 'Use Rollup')
    .option('--nocfg, --noconfig', "Don't try to load tool specific config")
    // output
    .option('--tmp', 'Write generated files to OS temp dir')
    // (pre) compilation
    .option(
      '--prod',
      'Use prod build (default is prod build with build command, dev build ' +
        'with dev command)'
    )
    .option('--raw', 'Use Svench from source instead of precompiled')
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
    .option('--host [host]', 'specify hostname (Vite only)')
    // .option('--reload', 'Clear local cache (Snowpack only)')
    .option(
      '--recompile',
      'Force recompile Svench runtime, even if already present'
    )
    .action(
      handle(detectToolAndEnsureRuntime('dev'), normalizeBuildOptions(false))
    )

  /*
   * svench compile
   * svench compile svench
   * svench compile svench --prod
   * svench compile svench --no-prod
   * svench compile app
   */
  prog
    .command('build [dir]', 'Build your Svench')
    .option(
      '--plugin, --svelte-plugin <plugin>',
      'Specify name of the Svelte plugin to use'
    )
    .option('--minify', 'Enable/disable minification', { default: true })
    .option(
      '--recompile',
      'Force recompile Svench runtime, even if already present'
    )
    .action(
      handle(detectToolAndEnsureRuntime('build'), normalizeBuildOptions(true))
    )

  // svench compile
  prog
    .command('compile [target]', 'Build Svench runtime with your local Svelte')
    .option('--dev', 'Only build dev runtime (equivalent to --no-prod)', {
      default: false,
    })
    .option('--minify', 'Enable/disable minification', { default: true })
    // .option('--svelte <dir>', 'Location of Svelte to use')
    .action(handle('compile', normalizeCompileOptions))

  // svench debug
  prog
    .command(
      'inspect [item]',
      'Report about detected tooling (for diagnostic purpose)'
    )
    .option('--load-config, --load, -l', 'Load config contents', {
      default: false,
    })
    .action(handle('inspect', normalizeInspectOptions))

  prog.parse(argv)

  return done
}
