import * as path from 'path'
import { pipe, isRollupV1 } from './util'
import findup from './findup'

export const defaultOutput = {
  format: 'es',
  file: null,
  dir: '.svench/dist',
  entryFileNames: 'svench.js',
}

const serveDefaults = {
  host: 'localhost',
  port: 4242,
  public: '.svench/dist',
  index: undefined,
  nollup: 'localhost:8080',
}

export const parseIndexOptions = ({
  source,
  write,
  encoding = 'utf8',
  replace = {},
} = {}) => ({ source, write, encoding, replace })

export const parseOptions = pipe(
  ({
    enabled = !!process.env.SVENCH,

    watch = !!process.env.ROLLUP_WATCH,

    dir = 'src',

    ignore = path => /(?:^|\/)(?:node_modules|\.git)\//.test(path),

    manifestDir = path.join(
      path.dirname(findup(__dirname, 'package.json')),
      'tmp'
    ),

    // Routix route import resolver
    // (path: string) => (resolvedPath: string)
    resolveRouteImport,

    // overrides of Rollup / Snowpack config
    override = false,

    // overrides of Svelte plugin options
    svelte,

    mountEntry = '/__svench/svench.js',

    index = true,

    serve = true,

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
    enabled,
    watch,
    dir,
    ignore,
    manifestDir,
    resolveRouteImport,
    extensions,
    override,
    svelte,
    mountEntry,
    index,
    serve: serve && {
      ...serveDefaults,
      ...serve,
    },
    isNollup,
    mdsvex,
    md,
    autoComponentIndex,
    autoSections,
    keepTitleExtensions,
  }),
  // override.output: use default if override.output === true, otherwise default
  // to nothing
  ({ override, ...options }) => ({
    ...options,
    override: override && {
      ...override,
      output: override.output === true ? defaultOutput : override.output,
    },
  }),
  // disable serve if not watching
  ({ serve, ...options }) => ({
    ...options,
    serve: options.watch ? serve : false,
  })
)

export const parseSvenchifyOptions = pipe(
  ({
    noMagic = false,
    interceptSveltePlugin = !noMagic,
    esm = !noMagic,

    // force resolving Svelte plugin to rollup-plugin-svelte-hot with Svench,
    // even if it is rollup-plugin-svelte that is required in the config file
    //
    // allows using HMR with Svench only
    //
    forceSvelteHot = true,

    configFunction = !isRollupV1(),

    svelte,

    ...svench
  } = {}) => ({
    svench: parseOptions({
      enabled: true,
      override: {
        input: true,
        output: true,
      },
      index: true,
      serve: true,
      ...svench,
    }),

    svelte: {
      css: css => {
        css.write('.svench/dist/bundle.css')
      },
      ...svelte,
    },

    noMagic,
    interceptSveltePlugin,
    esm,
    configFunction,
    forceSvelteHot,
  })
)
