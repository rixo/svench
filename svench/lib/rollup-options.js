import * as path from 'path'

import { pipe, isRollupV1 } from './util.js'
import { parseOptions } from './config.js'

const serveDefaults = {
  host: 'localhost',
  port: 4242,
  // public: '.svench/dist',
  public: undefined,
  index: undefined,
  nollup: 'localhost:8080',
}

const transformRollupOutput = ({ override, distDir, entryFileName }) => {
  // guard: don't override output
  if (!override || !override.output) return

  // TODO should be in a preset?
  // case: use full defaults
  if (override.output === true) {
    return {
      format: 'es',
      dir: distDir,
      entryFileNames: entryFileName,
      sourcemap: true,
    }
  }

  // case: custom override
  const transformed = { ...override.output }
  if (transformed.file === true) {
    transformed.file = path.join(distDir, entryFileName)
  }
  if (transformed.dir === true || !transformed.file) {
    transformed.dir = distDir
  }
  return transformed
}

const resolveServe = ({ serve, publicDir }) => {
  if (!serve) return false
  const resolved = serve === true ? { ...serveDefaults } : { ...serve }
  if (!resolved.public) {
    resolved.public = publicDir
  }
  return resolved
}

export const finalizeRollupOptions = pipe(
  // override.output: use default if override.output === true, otherwise default
  // to nothing
  options => ({
    ...options,
    override: options.override && {
      ...options.override,
      input:
        options.override.input === true
          ? options.entryFile
          : options.override.input,
      output: transformRollupOutput(options),
    },
  }),
  // disable serve if not watching
  options => ({
    ...options,
    serve: options.watch ? resolveServe(options) : false,
  })
)

export const parseSvenchifyOptions = ({
  noMagic = false,
  interceptSveltePlugin = !noMagic,
  esm = !noMagic,

  // force resolving Svelte plugin to rollup-plugin-svelte-hot with Svench,
  // even if it is rollup-plugin-svelte that is required in the config file
  //
  // allows using HMR with Svench only
  //
  // 2020-12-22 stop forcing, instead hoping for svelte-hmr to be integrated
  // into rollup-plugin-svelte (using rixo/rollup-plugin-svelte#svelte-hmr for
  // now)
  //
  forceSvelteHot = false,

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
    presets: 'svench/presets/rollup',
    ...svench,
    _finalizeOptions: finalizeRollupOptions,
  }),

  svelte: {
    // css: css => {
    //   css.write('.svench/dist/bundle.css')
    // },
    emitCss: false,
    hot: true, // TODO hmm :-/
    ...svelte,
  },

  noMagic,
  interceptSveltePlugin,
  esm,
  configFunction,
  forceSvelteHot,
})
