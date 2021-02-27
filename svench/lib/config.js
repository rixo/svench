import * as path from 'path'

import { pipe } from './util.js'
import { maybeDump } from './dump.js'

import { importDefaultRelative } from './import-relative.cjs'

const ALREADY_PARSED = Symbol('Svench: already parsed options')

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

const applyPresets = ({ preset, presets, ...options }) => {
  const { cwd } = options

  if (preset && presets) {
    throw new Error("Can't use both preset and presets")
  }

  const resolved = presets || preset

  if (!resolved) return options

  const presetArray = ensureArray(resolved).filter(Boolean)

  const requirePreset = id => importDefaultRelative(id, cwd)

  const resolvePreset = preset =>
    typeof preset === 'string'
      ? requirePreset(preset)
      : Array.isArray(preset)
      ? preset.map(resolvePreset)
      : preset

  return presetArray
    .map(resolvePreset)
    .flat()
    .filter(Boolean)
    .reduce((opts, fn) => fn(opts), { ...options, presets: presetArray })
}

const customizer = customizerOpt => options => {
  const customize = options[customizerOpt]
  if (!customize) return options
  return customize(options)
}

const prepareOptions = customizer('_prepareOptions')

const finalizeOptions = customizer('_finalizeOptions')

const validateOptions = ({ preset, presets, ...options }) => {
  return { ...options, presets: presets || preset }
}

const withCwd = ({ cwd = process.cwd(), ...opts }) => ({ cwd, ...opts })

const dumpFromEnv = ({ dump = process.env.DUMP, ...opts }) => ({
  dump,
  ...opts,
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
  _finalizeOptions,

  presets,

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

  // overrides of Rollup / Snowpack config
  override = false,

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

  // unknown options... who knows?
  ..._
}) => ({
  _finalizeOptions,
  presets,
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
  override,
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
  _,
})

// to prevent extraneous parsing
const earMark = config => {
  config[ALREADY_PARSED] = true
  return config
}

const doParseOptions = pipe(
  // maybeDumpOptions('input:options'),
  dumpFromEnv,
  prepareOptions,
  withCwd,
  validateOptions,
  applyPresets,
  maybeDumpOptions(['preset:options', 'presets:options']),
  resolveDirs,
  maybeDumpOptions('resolveDirs:options'),
  castOptions,
  // finalize -- offers an opportunity to tooling (e.g. snowpack) specific
  // plugins to customize, or validated options
  finalizeOptions,
  earMark
)

export const mergePresets = (options, presets = []) => {
  if (!options) return options
  if (options === true) return { presets }
  const existing = ensureArray(options.presets || options.preset || [])
  return { ...options, presets: [...existing, ...presets] }
}

export const parseOptions = options => {
  if (options && options[ALREADY_PARSED]) return options
  return doParseOptions(options)
}
