import { pipe, isRollupV1 } from './util'

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

    extensions = ['.svench', '.svench.svelte', '.svench.svx'],

    override = false,

    mountEntry = '/__svench/svench.js',

    index = true,

    serve = true,

    isNollup = !!process.env.NOLLUP,

    mdsvex = true,
    autoComponentIndex = '.svx',
    autoPage = '.svx',
  }) => ({
    enabled,
    watch,
    dir,
    extensions,
    override,
    mountEntry,
    index,
    serve: serve && {
      ...serveDefaults,
      ...serve,
    },
    isNollup,
    mdsvex,
    autoComponentIndex,
    autoPage,
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

    configFunction = !isRollupV1(),

    svelte,

    ...svench
  }) => ({
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
  })
)
