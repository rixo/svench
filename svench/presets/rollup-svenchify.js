/**
 * Rollup aggressive defaults for Svenchify.
 */

export default ({
  override: { input = true, output = true, ...override } = {},
  index = true,
  serve = true,
  ...options
}) => ({
  override: { input, output, ...override },
  index,
  serve,
  ...options,
})
