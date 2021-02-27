/**
 * Tooling inspection / autodetect.
 */

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

const normalizeOptions = o =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

const parseCliOptions = ({ dir, preset, config, snowpack, rollup }) =>
  normalizeOptions({
    dir,
    preset,
    config,
    snowpack,
    rollup,
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

const inspect = async ({
  load: loadConfig,
  snowpack,
  rollup,
  nollup,
  vite,
  ...rest
}) => {
  const cwd = process.cwd()
  const res = x => relative.resolve(x, cwd)

  const cliOptions = parseCliOptions(rest)

  const svenchConfig = readSvenchConfig(cwd, cliOptions.config)

  const info = {
    cwd,
  }

  const missingDeps = []

  const ensureDep = (target, optional = false) => {
    try {
      const _path = path.dirname(findup(res(target), 'package.json'))
      return {
        version: require(path.join(_path, 'package.json')).version,
        path: path.relative(cwd, _path),
      }
    } catch (error) {
      if (!optional) {
        missingDeps.push(target)
      }
      if (error.code === 'MODULE_NOT_FOUND') {
        return false
      }
      return { error }
    }
  }

  const findDeps = (targets, { optional = false } = {}) => {
    const deps = []
    for (const target of targets) {
      deps[target] = ensureDep(target, optional)
    }
    return deps
  }

  const findConfig = (configPath, req = require) =>
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

  {
    const config = vite || 'vite.config.js'
    if (vite || fs.existsSync(config)) {
      info.vite = {
        config: findConfig(config),
        deps: findDeps([
          // '@svitejs/vite-plugin-svelte',
          'rollup-plugin-svelte-hot',
        ]),
      }
    }
  }

  {
    const config = snowpack || 'snowpack.config.js'
    if (snowpack || fs.existsSync(config)) {
      info.snowpack = {
        config: findConfig(config),
        deps: findDeps(['snowpack', '@snowpack/plugin-svelte']),
      }
    }
  }

  {
    const config = rollup || nollup || 'rollup.config.js'
    if (rollup || nollup || fs.existsSync(config)) {
      process.env.ROLLUP_WATCH =
        process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH
      const deps = {
        ...findDeps(['rollup']),
        ...findDeps(
          ['nollup', 'rollup-plugin-svelte', 'rollup-plugin-svelte-hot'],
          {
            optional: true,
          }
        ),
      }
      if (!deps['rollup-plugin-svelte'] && !deps['rollup-plugin-svelte-hot']) {
        missingDeps.push(
          'Svelte plugin (rollup-plugin-svelte or rollup-plugin-svelte-hot)'
        )
      }
      info.rollup = {
        config: findConfig(config, requireEsm),
        deps: deps,
      }
    }
  }

  info.args = cliOptions

  info.options = mergeOptions(svenchConfig, cliOptions)

  info.favorite = vite
    ? 'vite'
    : snowpack
    ? 'snowpack'
    : nollup
    ? 'nollup'
    : rollup
    ? 'rollup'
    : info.vite
    ? 'vite'
    : info.snowpack
    ? 'snowpack'
    : info.rollup
    ? info.rollup.deps.nollup && !info.rollup.deps.nollup.error
      ? 'nollup'
      : 'rollup'
    : undefined

  info.missingDeps = missingDeps

  return info
}

module.exports = { inspect }
