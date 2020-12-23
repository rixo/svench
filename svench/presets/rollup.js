/**
 * Rollup specific defaults.
 */

module.exports = ({
  //
  watch = !!process.env.ROLLUP_WATCH,
  ...options
}) => ({
  watch,
  ...options,
})
