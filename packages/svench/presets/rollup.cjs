/**
 * Rollup specific defaults.
 */

const path = require('path')
const Log = require('../lib/log.js')

const serveDefaults = {
  host: 'localhost',
  port: 4242,
  // public: '.svench/dist',
  public: undefined,
  index: undefined,
  nollup: 'localhost:8080',
}

const transformRollupOutput = ({ rollup, distDir, entryFile }) => {
  // guard: don't override output
  if (!rollup || !rollup.output) return

  const entryFileName = path.basename(entryFile)

  // case: use full defaults
  if (rollup.output === true) {
    return {
      format: 'es',
      dir: distDir,
      entryFileNames: entryFileName,
      sourcemap: true,
    }
  }

  // case: custom override
  const transformed = { ...rollup.output }
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

const rollup = {
  pre: ({ override, rollup = override, ...opts }) => {
    if (override) {
      Log.warn('options.override is deprecated, use options.rollup instead')
    }
    return {
      rollup,
      ...opts,
    }
  },

  svenchify: ({
    rollup: { input = true, output = true, ...rollup } = {},
    index = true,
    serve = true,
    svelte: { emitCss = false, ...svelte } = {},
    ...options
  }) => ({
    rollup: { input, output, ...rollup },
    svelte: { ...svelte, emitCss },
    index,
    serve,
    ...options,
  }),

  transform: ({
    //
    watch = !!+process.env.ROLLUP_WATCH,

    publicDir = 'public',
    distDir = 'public/build',

    serve = true,

    ...options
  }) => ({
    watch,
    publicDir,
    distDir,
    serve,
    ...options,
  }),

  post: [
    // rollup.output: use default if rollup.output === true, otherwise
    // defaults to nothing
    options => ({
      ...options,
      rollup: options.rollup && {
        ...options.rollup,
        input:
          options.rollup.input === true
            ? options.entryFile
            : options.rollup.input,
        output: transformRollupOutput(options),
      },
    }),
    // disable serve if not watching
    options => ({
      serve: options.watch ? resolveServe(options) : false,
      ...options,
    }),
  ],
}

const nollup = ({ isNollup, write = true, serve, ...options }) =>
  isNollup && {
    watch: true, // Nollup is always watch
    write,
    serve: serve && {
      nollup: 'localhost:42421',
      ...serve,
    },
    ...options,
  }

module.exports = [nollup, rollup]
