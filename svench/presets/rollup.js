/**
 * Rollup specific defaults.
 */

const rollup = ({
  //
  watch = !!+process.env.ROLLUP_WATCH,

  publicDir = 'public',
  distDir = 'public/build',

  serve = true,

  isNollup = !!+process.env.NOLLUP,

  ...options
}) => ({
  watch,
  publicDir,
  distDir,
  serve,
  isNollup,
  ...options,
})

const ifNollup = preset => opts => {
  if (!opts.isNollup) return opts
  return preset(opts)
}

const nollup = ({
  watch = true, // Nollup is always watch
  write = true,
  index = true,
  serve,
  ...options
}) => ({
  watch,
  write,
  index,
  serve: serve && {
    nollup: 'localhost:42421',
    ...serve,
  },
  ...options,
})

export default [rollup, ifNollup(nollup)]
