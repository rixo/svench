/**
 * Centralize Svench runtime file generation scheme.
 */

const getRuntimeFilename = (prefix, { svenchVersion, svelteVersion, mode }) =>
  `runtime/${prefix}-${svenchVersion}_${svelteVersion}_${mode}.js`

module.exports = { getRuntimeFilename }
