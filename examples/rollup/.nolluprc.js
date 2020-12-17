const path = require('path')

const isSvench = !!process.env.SVENCH

module.exports = {
  config: path.resolve(
    isSvench ? `rollup.config.svench.js` : `rollup.config.js`
  ),
  hot: true,
  port: 42421,
  watch: [
    'src',
    '.svench',
    'node_modules/svench',
    '../packages/svench/src',
    '../packages/svench/themes',
  ],
}
