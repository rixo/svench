const path = require('path')

const isSvench = !!process.env.SVENCH

module.exports = isSvench
  ? {
      config: path.resolve(
        isSvench ? `rollup.config.svench.js` : `rollup.config.js`
      ),
      hot: true,
      port: 42421,
      publicPath: 'build',
      watch: [
        'src',
        '.svench',
        // NOTE the following are only useful during dev of Svench itself
        'node_modules/svench',
        '../packages/svench/src',
        '../packages/svench/themes',
      ],
    }
  : // why not benefit from Nollup's speed during your main app's dev, too?
    // NOTE this only works because this example is using a fork of
    //      rollup-plugin-svelte with added HMR support (situation in the
    //      process of being resolved more elegantly)
    {
      hot: true,
      port: 5000,
      watch: ['src'],
      contentBase: 'public',
    }
