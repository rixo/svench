/**
 * Tooling inspection / autodetect.
 */

import fs from 'fs'
import path from 'path'

import { importSync, resolveSync } from './import-relative.cjs'
import { importAbsolute } from './util.js'

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
  return null
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

const readSvenchConfig = async (cwd, configOption) => {
  if (configOption === true) {
    configOption = 'svench.config.js'
  }
  if (typeof configOption === 'string') {
    const file = path.resolve(cwd, configOption)
    if (fs.existsSync(file)) {
      return {
        path: path.relative(cwd, file),
        config: (await import(file)).default,
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

const loadJson = async file =>
  JSON.parse(await fs.promises.readFile(file, 'utf8'))

export const inspect = async ({
  cwd,
  load: loadConfig,
  snowpack,
  rollup,
  nollup,
  vite,
  ...rest
}) => {
  const standalone =
    typeof process.env.SVENCH_STANDALONE === 'string'
      ? process.env.SVENCH_STANDALONE
      : false

  const resolveOptions = { preserveSymlinks: true }

  const res = x => resolveSync(x, { ...resolveOptions, basedir: cwd })

  // svench-cli
  const resolveFromSvenchCli =
    standalone &&
    (x =>
      resolveSync(x, {
        ...resolveOptions,
        basedir: standalone,
      }))

  const cliOptions = parseCliOptions(rest)

  const svenchConfig = await readSvenchConfig(cwd, cliOptions.config)

  const _ensureDep = async (target, resolve = res) => {
    try {
      const index = resolve(target)
      const dir = path.dirname(findup(index, 'package.json'))
      const relPath = path.relative(cwd, dir)
      const { version } = await loadJson(path.join(dir, 'package.json'))
      return {
        package: target,
        version,
        path: index,
        dir,
        depth: -(relPath.split('..' + path.sep).length - 1) || 0,
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        return false
      }
      return { error }
    }
  }

  const ensureDep = async (target, standalone = true) =>
    (await _ensureDep(target)) ||
    (resolveFromSvenchCli &&
      standalone &&
      (await _ensureDep(target, resolveFromSvenchCli))) ||
    false

  const findDeps = async (targets, missingDeps) => {
    const deps = []
    for (const target of targets) {
      if (Array.isArray(target)) {
        let found = false
        for (const alternative of target) {
          deps[alternative] = await ensureDep(alternative)
          if (deps[alternative] && !deps[alternative].error) {
            found = true
          }
        }
        if (!found) {
          missingDeps.add(target.join(' or '))
        }
      } else {
        deps[target] = await ensureDep(target)
        if (missingDeps && (!deps[target] || deps[target].error)) {
          missingDeps.add(target)
        }
      }
    }
    return deps
  }

  const findConfig = async (
    configPath,
    req = x => importAbsolute(x).then(m => m.default)
  ) => {
    if (!configPath) return false
    const resolved = path.relative(cwd, path.resolve(cwd, configPath))
    return loadConfig
      ? {
          path: resolved,
          config: await req(path.resolve(cwd, configPath)),
        }
      : { path: configPath, exists: fs.existsSync(resolved) }
  }

  // === System ===

  const info = {
    cwd,
    missingDeps: [],
    standalone,
  }

  // === App ===

  {
    let root = cwd
    let name, version, type
    const packageJson = findup(cwd, 'package.json')
    if (packageJson) {
      root = path.dirname(packageJson)
      ;({ name, version, type } = await loadJson(
        path.join(root, 'package.json')
      ))
    }
    info.app = {
      name,
      version,
      type,
      root,
    }
  }

  if (info.app.type === 'module') {
    // NOTE @sveltejs/vite-plugin-svelte exposes both main/module and a exports
    // map. `resolve` package doesn't seem to use the `exports` path, only main,
    // not even `module`. This means that when running in ESM, we must force using
    // `module` over `main` if it exists (ideal would be supporting the `exports`
    // map), or we're running into CJS/ESM conflict (especially since the legacy
    // approach aboves implies `esm` module).
    resolveOptions.packageFilter = pkg => ({
      ...pkg,
      main: pkg.module || pkg.main,
    })
  }

  // === Svench ===

  info.svench = await ensureDep('svench')
  if (info.svench) {
    info.svench.config = svenchConfig
    const cli = path.join(info.svench.dir, 'cli.bin.js')
    info.svench.cli = fs.existsSync(cli) && cli
  }

  // === Svelte ===

  info.svelte = await ensureDep('svelte')
  if (info.svelte) {
    const compiler = path.join(info.svelte.dir, 'compiler.mjs')
    if (fs.existsSync(compiler)) {
      info.svelte.compiler = compiler
    }
  }

  // === Vite ===
  {
    const config = typeof vite === 'string' ? vite : 'vite.config.js'
    if (vite || fs.existsSync(config) || (await ensureDep('vite'))) {
      const missingDeps = new Set()
      const sveltePluginAlternatives = [
        '@sveltejs/vite-plugin-svelte',
        '@svitejs/vite-plugin-svelte',
        'rollup-plugin-svelte-hot',
      ]
      const deps = await findDeps(
        ['vite', sveltePluginAlternatives],
        missingDeps
      )
      const sveltePlugin = sveltePluginAlternatives
        .map(name => deps[name])
        .filter(depInfo => depInfo && !depInfo.error)
        .sort(({ depth: a }, { depth: b }) => b - a)
        .slice(0, 1)
        .map(({ package: pkg }) => pkg)
        .shift()
      info.vite = {
        config: await findConfig(config),
        deps,
        missingDeps: [...missingDeps],
        sveltePlugin,
        vitePath: deps && deps.vite && deps.vite.path,
        sveltePluginPath: deps && deps[sveltePlugin] && deps[sveltePlugin].path,
      }
    }
  }

  // === Snowpack ===
  {
    const config = snowpack || 'snowpack.config.js'
    if (snowpack || fs.existsSync(config)) {
      const missingDeps = new Set()
      info.snowpack = {
        config: await findConfig(config, missingDeps),
        deps: await findDeps(
          ['snowpack', '@snowpack/plugin-svelte'],
          missingDeps
        ),
        missingDeps: [...missingDeps],
      }
    }
  }

  // === Rollup / Nollup ===
  {
    const config = rollup || nollup || 'rollup.config.js'
    if (rollup || nollup || fs.existsSync(config)) {
      process.env.ROLLUP_WATCH =
        process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH
      const missingDeps = new Set()
      const sveltePluginAlternatives = [
        'rollup-plugin-svelte',
        'rollup-plugin-svelte-hot',
      ]
      const deps = await findDeps(
        ['rollup', 'nollup', sveltePluginAlternatives],
        missingDeps
      )

      const sveltePlugin = sveltePluginAlternatives
        .map(name => deps[name])
        .filter(depInfo => depInfo && !depInfo.error)
        .sort(({ depth: a }, { depth: b }) => b - a)
        .slice(0, 1)
        .map(({ package: pkg }) => pkg)
        .shift()

      if (deps.nollup) {
        const devServer = path.join(deps.nollup.dir, 'lib/dev-server.js')
        if (fs.existsSync(devServer)) {
          deps.nollup.devServer = devServer
        }
      }

      info.rollup = {
        config: await findConfig(
          config === true ? 'rollup.config.js' : config,
          importSync
        ),
        deps: deps,
        missingDeps: [...missingDeps],
        rollupPath: deps && deps.rollup && deps.rollup.path,
        sveltePlugin,
        sveltePluginPath: deps && deps[sveltePlugin] && deps[sveltePlugin].path,
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
    !rollup &&
    info.favorite === 'rollup' &&
    info.rollup.deps.nollup &&
    !info.rollup.deps.nollup.error
  ) {
    info.favorite = 'nollup'
  }

  if (info.favorite) {
    const key = info.favorite === 'nollup' ? 'rollup' : info.favorite
    info.missingDeps = info[key].missingDeps
  }

  if (!info.svench) info.missingDeps.push('svench')
  if (!info.svelte) {
    info.missingDeps.push('svelte')
  } else {
    if (!info.svelte.compiler) info.missingDeps.push('svelte/compiler')
  }

  return info
}
