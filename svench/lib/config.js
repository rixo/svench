import * as path from 'path'
import * as fs from 'fs'

import { pipe } from './util.js'

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

const resolvePreset = preset =>
  typeof preset === 'string' ? require.main.require(preset) : preset

const applyPresets = options => {
  const { presets } = options
  if (!presets) return options
  return Array.isArray(presets)
    ? presets.map(resolvePreset).reduce((opts, fn) => fn(opts), options)
    : resolvePreset(presets)(options)
}

const finalizeOptions = options => {
  const finalizer = options._finalizeOptions
  if (!finalizer) return options
  return finalizer(options)
}

const validateOptions = ({ preset, presets, ...options }) => {
  if (preset && presets) {
    throw new Error("Can't use both preset and presets")
  }
  return { ...options, presets: presets || preset }
}

const castOptions = ({
  _finalizeOptions,

  presets,

  enabled = !!process.env.SVENCH,

  watch = false,

  dir = 'src',

  ignore = path => /(?:^|\/)(?:node_modules|\.git)\//.test(path),

  // a directory to contains all Svench generated things (or even merely
  // _related_ -- could include user created files)
  svenchDir = 'node_modules/.cache/svench',

  manifestDir = path.join(svenchDir, 'src'),
  publicDir = path.join(svenchDir, 'public'),
  distDir = path.join(publicDir, 'build'),

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
  manifest: manifest && {
    css: 'js',
    ui: 'svench/src/app/index.js', // TODO move to 'svench/app'
    write: true,
    ...manifest,
  },
  mountEntry,
  index,
  serve: serve && {
    ...serveDefaults,
    public: publicDir,
    ...serve,
  },
  isNollup,
  mdsvex,
  md,
  autoComponentIndex,
  autoSections,
  keepTitleExtensions,
})

export const parseOptions = pipe(
  validateOptions,
  applyPresets,
  castOptions,
  // finalize -- offers an opportunity to tooling (e.g. snowpack) specific
  // plugins to customize, or validated options
  finalizeOptions
)
