/* eslint-env node */

export default {
  keepTitleExtensions: [],
  ignore: x => /\.bak(?:$|\/)/.test(x),
}
