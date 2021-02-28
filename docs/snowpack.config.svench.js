const { svenchify } = require('svench/snowpack')

module.exports = svenchify(require('./snowpack.config.js'), {
  sveltePlugin: require('@snowpack/plugin-svelte'),

  dir: './src',
})
