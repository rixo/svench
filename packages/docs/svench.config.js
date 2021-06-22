/* eslint-env node */

module.exports = {
  keepTitleExtensions: [],
  ignore: x => /\.bak(?:$|\/)/.test(x),
}
