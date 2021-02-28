import * as path from 'path'

import { pipe } from './util.js'
import { maybeDump } from './dump.js'

import { importDefaultRelative } from './import-relative.cjs'

const ALREADY_PARSED = Symbol('Svench: already parsed options')

const POST = Symbol('Svench: presets post processors')

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

export const mergePresets = (options, presets = []) => {
  if (!options) return options
  if (options === true) return { presets }
  const existing = ensureArray(options.presets || options.preset || [])
  return { ...options, presets: [...existing, ...presets] }
}

const runPresets = (presets, options) =>
  presets.reduce((o, f) => f(o) || o, options)

const applyPresets = ({ presets, ...options }) => {
  const { cwd } = options

  if (!presets) return options

  const presetArray = ensureArray(presets).filter(Boolean)

  const requirePreset = id => importDefaultRelative(id, cwd)

  const resolvePreset = preset =>
    typeof preset === 'string'
      ? requirePreset(preset)
      : Array.isArray(preset)
      ? preset.map(resolvePreset)
      : preset

  const hooks = ['pre', 'svenchify', 'transform', 'post']

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

  options[POST] = stages.post.flat(Infinity).filter(Boolean)

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

const applyPresetsPost = customizer(POST)

const withCwd = ({ cwd = process.cwd(), ...opts }) => ({ cwd, ...opts })

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
    svenchDir,
    manifestDir: resolve(manifestDir),
    publicDir,
    distDir: resolve(distDir),
  }
}

const castOptions = ({
  enabled = !!+process.env.SVENCH,

  watch = false,

  dir = 'src',

  ignore = path => /(?:^|\/)(?:node_modules|\.git)\//.test(path),

  write = true,

  // a directory to contains all Svench generated things (or even merely
  // _related_ -- could include user created files)
  svenchDir,

  manifestDir,
  publicDir,
  distDir,

  entryFileName = 'svench.js',
  routesFileName = 'routes.js',

  port = 4242,

  // Routix route import resolver
  // (path: string) => (resolvedPath: string)
  resolveRouteImport,

  // overrides of Rollup / Vite / Snowpack config
  rollup = null,
  vite = null,
  snowpack = null,

  // overrides of Svelte plugin options
  svelte,

  // Allow to specify a custom Svelte plugin
  sveltePlugin,

  manifest = true,

  mountEntry = '/__svench/svench.js',

  index = false,

  serve = false,

  isNollup = !!process.env.NOLLUP,

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

  [POST]: postPresets,

  // unknown options... who knows?
  ..._
}) => ({
  enabled,
  watch,
  dir,
  ignore,
  svenchDir,
  manifestDir,
  distDir,
  publicDir,
  entryFileName,
  entryFile: path.join(manifestDir, entryFileName),
  routesFileName,
  routesFile: path.join(manifestDir, routesFileName),
  port,
  resolveRouteImport,
  extensions,
  rollup,
  vite,
  snowpack,
  svelte,
  sveltePlugin,
  manifest: manifest && {
    css: 'js',
    ui: 'svench/src/app/index.js', // TODO move to 'svench/app'
    write,
    ...manifest,
  },
  mountEntry,
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
  [POST]: postPresets,
  _,
})

// to prevent extraneous parsing
const earMark = config => {
  config[ALREADY_PARSED] = true
  return config
}

// TODO implement? throw away?
//
// const mergeableArrayOptions = ['presets', 'dir', 'ignore', 'extensions']
//
// const mergeableOptions = [
//   // dev server
//   'rollup',
//   'vite',
//   'snowpack',
//   // svelte options
//   'svelte',
//   // svench
//   'manifest',
//   'index',
//   'serve',
// ]
//
// export const mergeOptions = (a, b) => {
//   const merged = { ...a, ...b }
//   for (const opt of mergeableArrayOptions) {
//     const ax = a[opt]
//     const bx = b[opt]
//     if (ax == null && bx == null) continue
//     merged[opt] = [...new Set([ax, bx].filter(Boolean).flat())]
//   }
//   for (const opt of mergeableOptions) {
//     const bx = b[opt]
//     if (bx === false) {
//       merged[opt] = false
//       continue
//     }
//     const a_exists = a.hasOwnProperty(opt)
//     const b_exists = b.hasOwnProperty(opt)
//     if (!a_exists && !b_exists) continue
//     const ax = a[opt]
//     merged[opt] = (ax || bx) && { ...ax, ...bx }
//   }
//   return merged
// }

const doParseOptions = pipe(
  maybeDumpOptions('input:options'),
  withEnv,
  withCwd,
  applyPresets,
  maybeDumpOptions(['preset:options', 'presets:options']),
  resolveDirs,
  maybeDumpOptions('resolveDirs:options'),
  castOptions,
  applyPresetsPost,
  earMark,
  maybeDumpOptions('options')
)

export const resolveOptions = options => {
  if (options && options[ALREADY_PARSED]) return options
  return doParseOptions(options)
}
