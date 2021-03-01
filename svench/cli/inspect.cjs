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

  const ensureDep = (target, missingDeps) => {
    try {
      const _path = path.dirname(findup(res(target), 'package.json'))
      return {
        version: require(path.join(_path, 'package.json')).version,
        path: path.relative(cwd, _path),
      }
    } catch (error) {
      if (missingDeps) {
        missingDeps.add(target)
      }
      if (error.code === 'MODULE_NOT_FOUND') {
        return false
      }
      return { error }
    }
  }

  const findDeps = (targets, missingDeps) => {
    const deps = []
    for (const target of targets) {
      deps[target] = ensureDep(target, missingDeps)
    }
    return deps
  }

  const findConfig = (configPath, req = require) => {
    const resolved = path.relative(cwd, path.resolve(cwd, configPath))
    return loadConfig
      ? {
          path: resolved,
          config: req(path.resolve(cwd, configPath)),
        }
      : { path: configPath, exists: fs.existsSync(resolved) }
  }

  info.svench = {
    ...ensureDep('svench'),
    config: svenchConfig,
  }

  {
    const config = typeof vite === 'string' ? vite : 'vite.config.js'
    if (vite || fs.existsSync(config) || ensureDep('vite')) {
      const missingDeps = new Set()
      info.vite = {
        config: findConfig(config),
        deps: findDeps(
          [
            'vite',
            // '@svitejs/vite-plugin-svelte',
            'rollup-plugin-svelte-hot',
          ],
          missingDeps
        ),
        missingDeps: [...missingDeps],
      }
    }
  }

  {
    const config = snowpack || 'snowpack.config.js'
    if (snowpack || fs.existsSync(config)) {
      const missingDeps = new Set()
      info.snowpack = {
        config: findConfig(config, missingDeps),
        deps: findDeps(['snowpack', '@snowpack/plugin-svelte'], missingDeps),
        missingDeps: [...missingDeps],
      }
    }
  }

  {
    const config = rollup || nollup || 'rollup.config.js'
    if (rollup || nollup || fs.existsSync(config)) {
      process.env.ROLLUP_WATCH =
        process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH
      const missingDeps = new Set()
      const deps = {
        ...findDeps(['rollup'], missingDeps),
        ...findDeps([
          'nollup',
          'rollup-plugin-svelte',
          'rollup-plugin-svelte-hot',
        ]),
      }
      if (!deps['rollup-plugin-svelte'] && !deps['rollup-plugin-svelte-hot']) {
        missingDeps.push(
          'Svelte plugin (rollup-plugin-svelte or rollup-plugin-svelte-hot)'
        )
      }
      info.rollup = {
        config: findConfig(config, requireEsm),
        deps: deps,
        missingDeps: [...missingDeps],
      }
    }
  }

  info.args = cliOptions

  info.options = mergeOptions(svenchConfig, cliOptions)

  const tools = ['vite', 'rollup', 'snowpack']

  const withConfigAndNoMissingDeps = tools.filter(tool => {
    if (!info[tool]) return false
    const { config, missingDeps } = info[tool]
    if (!config || config.exists === false) return false
    if (missingDeps.length > 0) return false
    return true
  })

  const withNoMissingDeps = tools.filter(tool => {
    if (!info[tool]) return false
    const { missingDeps } = info[tool]
    if (missingDeps.length > 0) return false
    return true
  })

  info.favorite = vite
    ? 'vite'
    : snowpack
    ? 'snowpack'
    : nollup
    ? 'nollup'
    : rollup
    ? 'rollup'
    : withConfigAndNoMissingDeps.length > 0
    ? withConfigAndNoMissingDeps[0]
    : withNoMissingDeps.length > 0
    ? withNoMissingDeps[0]
    : undefined

  if (
    info.favorite === 'rollup' &&
    info.rollup.deps.nollup &&
    !info.rollup.deps.nollup.error
  ) {
    info.favorite = 'nollup'
  }

  if (info.favorite) {
    info.missingDeps = info[info.favorite].missingDeps
  }

  return info
}

module.exports = { inspect }
