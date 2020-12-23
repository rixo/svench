const fs = require('fs')
const path = require('path')
const relative = require('require-relative')

let _requireEsm

const requireEsm = name => {
  if (!_requireEsm) {
    _requireEsm = require('esm')(module)
  }
  return _requireEsm(name).default
}

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

const normalizeDirs = dirs => (dirs.length === 1 ? dirs[0] : dirs)

const normalizeOptions = o =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

const parseCliOptions = (dir, { _, preset, config, snowpack }) =>
  normalizeOptions({
    dir: normalizeDirs([dir, ..._]),
    preset,
    config,
    snowpack,
  })

const readSvenchConfig = (cwd, configOption) => {
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

const mergeOptions = (
  { config } = {},
  {
    // eslint-disable-next-line no-unused-vars
    config: _,
    ...cli
  }
) => ({
  ...config,
  ...cli,
})

const debug = async (...args) => {
  const [, { 'load-config': loadConfig }] = args
  const cwd = process.cwd()
  const res = x => relative.resolve(x, cwd)

  const cliOptions = parseCliOptions(...args)

  const svenchConfig = readSvenchConfig(cwd, cliOptions.config)

  const info = {
    cwd,
    args: cliOptions,
    options: mergeOptions(svenchConfig, cliOptions),
  }

  const missingDeps = []

  const ensureDep = target => {
    try {
      const _path = path.dirname(findup(res(target), 'package.json'))
      return {
        version: require(path.join(_path, 'package.json')).version,
        path: path.relative(cwd, _path),
      }
    } catch (err) {
      missingDeps.push(target)
      return err.message.split('\n').shift()
    }
  }

  const ensureDeps = targets => {
    const deps = []
    for (const target of targets) {
      deps[target] = ensureDep(target)
    }
    return deps
  }

  const parseConfig = (configPath, req = require) =>
    loadConfig
      ? {
          path: path.relative(cwd, path.resolve(cwd, configPath)),
          config: req(path.resolve(cwd, configPath)),
        }
      : { path: configPath }

  info.svench = {
    ...ensureDep('svench'),
    config: svenchConfig,
  }

  await Promise.all([
    new Promise(resolve => {
      const config = 'snowpack.config.js'
      fs.exists(config, exists => {
        if (!exists) return resolve()
        info.snowpack = {
          config: parseConfig(config),
          deps: ensureDeps(['snowpack', '@snowpack/plugin-svelte']),
        }
        resolve()
      })
    }),

    new Promise(resolve => {
      const config = 'rollup.config.js'
      fs.exists(config, exists => {
        if (exists) {
          process.env.ROLLUP_WATCH =
            process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH
          info.rollup = {
            config: parseConfig(config, requireEsm),
            deps: ensureDeps(['rollup', 'rollup-plugin-svelte']),
          }
        }
        resolve()
      })
    }),
  ])

  console.log(require('util').inspect(info, { depth: 999, colors: true }))

  if (missingDeps.length > 0) {
    console.warn(`\n(!) Missing dependencies: ${missingDeps.join(', ')}\n`)
  }
}

module.exports = debug
