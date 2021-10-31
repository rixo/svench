import os from 'os'
import fs from 'fs'
import path from 'path'

import { pipe, noop, stringHashcode } from './util.js'
import { maybeDump } from './dump.js'

import { importSync } from './import-relative.cjs'

const ALREADY_PARSED = Symbol('Svench: already parsed options')

const HOOK_POST = Symbol('Svench: presets post processors')
const HOOK_MERGE = Symbol('Svench: merge hooks')
const HOOK_CAST = Symbol('Svench: cast hooks')

const serveDefaults = {
  host: 'localhost',
  port: 4242,
  public: undefined,
  index: undefined,
  nollup: 'localhost:8080',
}

export const parseIndexOptions = ({
  source,
  write,
  encoding = 'utf8',
  replace = {},
} = {}) => ({ source, write, encoding, replace })

// for use in options pipelines
const maybeDumpOptions = key => options => {
  maybeDump(key, options && options.dump, options)
  return options
}

const ensureArray = x => (!x ? x : Array.isArray(x) ? x : [x])

// export const mergePresets = (options, presets = []) => {
//   if (!options) return options
//   if (options === true) return { presets }
//   const existing = ensureArray(options.presets || options.preset || [])
//   return { ...options, presets: [...existing, ...presets] }
// }

const mergeableOptions = ['manifest', 'index', 'serve']

const mergeOptions = (a = {}, b = {}) => {
  const merged = { ...a, ...b }
  for (const option of mergeableOptions) {
    if (b[option] === false) {
      merged[option] = false
    } else if (b[option]) {
      merged[option] = { ...a[option], ...b[option] }
    }
  }
  return merged
}

/**
 * Apply user config from options.userConfig prop. Ideally, user config should
 * probably be loaded from here, to best centralize... But currently this
 * pipeline is required to be synchronous, and user config can be ESM that would
 * be async, so reading user config beforehand and passing it down for now.
 */
const applyUserConfig = ({ userConfig, ...options }) => {
  const merge = options[HOOK_MERGE]
  return userConfig ? merge(options, userConfig) : options
}

const runPresets = (presets, options) => {
  const merge = options[HOOK_MERGE]
  return presets.reduce((cur, f) => {
    const next = typeof f === 'function' ? f(cur) : f
    return next ? merge(cur, next) : cur
  }, options)
}

const applyPresets = ({ presets, ...options }) => {
  if (!presets) return options

  const resolveSvenchImports = id => {
    if (!options.svenchPath) return id
    if (!id.startsWith('svench/') && id !== 'svench') return id
    return path.join(path.dirname(options.svenchPath), id)
  }

  const presetArray = ensureArray(presets).filter(Boolean)

  const importPreset = pipe(resolveSvenchImports, importSync)

  // const requirePreset = id => importDefaultRelative(id, cwd)
  // const requirePreset = id => importDefaultRelative(id, cwd)

  const resolvePreset = preset =>
    typeof preset === 'string'
      ? resolvePreset(importPreset(preset))
      : Array.isArray(preset)
      ? preset.map(resolvePreset)
      : preset

  const flattenHooks = hooks => hooks.flat(Infinity).filter(Boolean)

  const hooks = ['merge', 'pre', 'svenchify', 'transform', 'cast', 'post']

  const stages = Object.fromEntries(hooks.map(key => [key, []]))

  presetArray
    .map(resolvePreset)
    .flat(Infinity)
    .filter(Boolean)
    .forEach(preset => {
      for (const key of hooks) {
        if (preset[key]) stages[key].push(preset[key])
      }
      if (typeof preset === 'function') stages.transform.push(preset)
    })

  const mergers = [mergeOptions, ...flattenHooks(stages.merge)]

  const casters = flattenHooks(stages.cast)

  options[HOOK_MERGE] = (a = {}, b = {}) => {
    const result = { ...a, ...b }
    for (const merge of mergers) {
      const patch = merge(a, b)
      if (patch) Object.assign(result, patch)
    }
    return result
  }

  options[HOOK_CAST] = rest => {
    const result = {}
    for (const cast of casters) {
      Object.assign(result, cast(rest))
    }
    return result
  }

  options[HOOK_POST] = flattenHooks(stages.post)

  const pipeline = ['pre', 'svenchify', 'transform']
    .map(key => stages[key])
    .flat(Infinity)
    .filter(Boolean)

  return runPresets(pipeline, options)
}

const customizer = prop => ({ [prop]: customize, ...options }) => {
  if (!customize) return options
  return runPresets(customize, options)
}

const applyPresetsPost = customizer(HOOK_POST)

const validate = options => {
  const { raw, prod } = options

  if (raw && prod) {
    throw new Error("--raw and --prod don't make sense together")
  }

  return options
}

const withCwd = ({ cwd = process.cwd(), ...opts }) => ({ cwd, ...opts })

const withDefaultDir = ({ cwd, dir, ...opts }) => {
  if (dir == null) {
    if (fs.existsSync(path.resolve(cwd, 'src'))) dir = 'src'
    else dir = '.'
  }
  return { cwd, dir, ...opts }
}

const withEnv = ({
  dump = process.env.DUMP,
  isNollup = !!+process.env.NOLLUP,
  ...options
}) => ({
  dump,
  isNollup,
  ...options,
})

const resolveDir = (cwd, base) => dir =>
  path.isAbsolute(dir)
    ? dir
    : dir.startsWith('./')
    ? path.join(cwd, dir)
    : path.join(base, dir)

const resolveTmp = options => {
  // tmp defaults to true when standalone
  const { standalone, tmp = !!standalone } = options
  if (!tmp) return { ...options, tmp }
  const {
    cwd,
    dir,
    svenchDir = `.svench-${stringHashcode(path.resolve(cwd, dir))}`,
  } = options
  return {
    ...options,
    tmp,
    svenchDir: path.join(os.tmpdir(), svenchDir),
  }
}

const resolveDirs = ({
  cwd,
  // a directory to contains all Svench generated things (or even merely
  // _related_ -- could include user created files)
  svenchDir: _svenchDir = '.svench',
  manifestDir = 'src',
  publicDir = 'public',
  distDir = 'build',
  ...config
}) => {
  if (_svenchDir.startsWith('./')) {
    throw new Error("svenchDir can't be a relative path: " + _svenchDir)
  }
  const svenchDir = resolveDir(cwd, cwd)(_svenchDir)
  const resolve = resolveDir(cwd, svenchDir)
  publicDir = resolve(publicDir)
  return {
    ...config,
    cwd,
    svenchDir,
    manifestDir: resolve(manifestDir),
    publicDir,
    distDir: resolve(distDir),
  }
}

const castOptions = ({
  cwd,

  tmp,

  standalone,
  svenchPath,
  sveltePath,
  svelteCompiler,

  // versions are passed down to presets to enable loading the correct
  // pre-compiled Svench runtime (that is named with Svench & Svelte versions)
  svenchVersion,
  svelteVersion,

  enabled = !!+process.env.SVENCH,

  watch = false,

  dir,

  ignore = path => /(?:^|\/)(?:node_modules|\.git)\//.test(path),

  write = true,

  // true if build mode, false if dev mode
  isBuild = false,

  // use raw sources as much as possible, instead of prebuilt Svench, for
  // dev mode of Svench itself (lighter prebuild, etc., to make HMR and all
  // work better when developping Svench components)
  raw = false,

  // use prod build of Svench: with compiler option dev to false, which means
  // components are only compatible with dev false user components (and vice
  // versa)
  prod = !raw && !!isBuild,

  // a directory to contains all Svench generated things (or even merely
  // _related_ -- could include user created files)
  svenchDir,

  manifestDir,
  publicDir,
  distDir,

  entryFileName = 'svench.js',
  routesFileName = 'routes.js',
  indexFileName = 'index.html',

  port = 4242,
  host = 'localhost',

  // Routix route import resolver
  // (path: string) => (resolvedPath: string)
  resolveRouteImport,

  // overrides of Rollup / Vite / Snowpack config
  // TODO migrate rollup & snowpack to cast
  rollup = null,
  snowpack = null,
  nocfg = false,

  // overrides of Svelte plugin options
  svelte,

  // Allow to specify a custom Svelte plugin
  sveltePlugin,
  // default is fed by Svenchify inspect, and will be used if there's no user
  // provided sveltePlugin
  defaultSveltePlugin,

  manifest = true,

  baseUrl = '/',
  entryUrl = true,
  mountEntry = '/__svench/svench.js',

  index = false,

  svenchIcon = !!write,

  serve = false,

  isNollup = false,

  // true|false|string
  // if true, default to '.svx', if string used as the extension
  mdsvex = '.svx',
  // true|false|string
  // if true, default to '.md', if string uses as the extension
  md = '.md',
  autoComponentIndex = '.svx',

  extensions = [
    '.svench',
    '.svench.svelte',
    mdsvex && '.svench.svx',
    md && '.md',
  ].filter(Boolean),

  // these directories (that must be in the root `dir`) are automatically
  // turned into sections
  autoSections = ['src'],

  // these extensions are kept in auto generated titles
  keepTitleExtensions = ['.md'],

  // debugging
  dump,

  // hook for merging tool config
  [HOOK_MERGE]: mergeHook,
  // hook for casting unknown options
  [HOOK_CAST]: castHook = noop,
  // `post` hooks
  [HOOK_POST]: postHook,

  // unknown options... who knows?
  ..._
}) => ({
  cwd,
  tmp,
  standalone,
  svenchPath,
  svenchVersion,
  sveltePath,
  svelteCompiler,
  svelteVersion,
  enabled,
  watch,
  dir,
  ignore,
  raw,
  prod: prod && !raw,
  isBuild,
  svenchDir,
  manifestDir,
  distDir,
  publicDir,
  entryFileName,
  routesFileName,
  indexFileName,
  port,
  host,
  resolveRouteImport,
  extensions,
  rollup,
  snowpack,
  nocfg,
  svelte,
  sveltePlugin,
  defaultSveltePlugin,
  manifest: manifest && {
    css: 'js',
    ui: raw ? 'svench/src/app/index.js' : 'svench/app.js',
    write, // TODO not implemented anymore? deprecate? (always write now)
    ...manifest,
  },
  mountEntry,
  baseUrl,
  entryUrl,
  svenchIcon,
  index: index && {
    write,
    ...index,
  },
  serve: serve && {
    ...serveDefaults,
    port,
    public: publicDir,
    ...serve,
  },
  isNollup,
  mdsvex,
  md,
  autoComponentIndex,
  autoSections,
  keepTitleExtensions,
  dump,
  [HOOK_MERGE]: mergeHook,
  [HOOK_POST]: postHook,
  ...castHook(_),
  _,
})

const resolveFiles = ({
  manifestDir,
  publicDir,
  entryFileName,
  entryFile = path.join(manifestDir, entryFileName),
  routesFileName,
  routesFile = path.join(manifestDir, routesFileName),
  ...options
}) => ({
  ...options,
  manifestDir,
  publicDir,
  entryFile,
  routesFile,
})

// to prevent extraneous parsing
const earMark = config => {
  config[ALREADY_PARSED] = true
  return config
}

const parseOptions = pipe(
  validate,
  maybeDumpOptions('input:options'),
  withEnv,
  withCwd,
  withDefaultDir,
  applyPresets,
  applyUserConfig,
  maybeDumpOptions(['preset:options', 'presets:options']),
  resolveTmp,
  maybeDumpOptions('resolveDirs:options'),
  resolveDirs,
  castOptions,
  resolveFiles,
  applyPresetsPost,
  earMark,
  maybeDumpOptions('options')
)

export const parseSvenchOptions = options => {
  if (options && options[ALREADY_PARSED]) return options
  return parseOptions(options)
}
