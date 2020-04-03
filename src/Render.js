import Render from './Render.svelte'

export default Render

export const matchPath = (resolveUrl, src) => {
  // const match = /^(.*?)(\/\*+)?$/.exec(src)
  // const [, prefix = '', suffix = ''] = match
  const srcPath = resolveUrl(src)
  // TODO real glob / wildcard support...
  if (srcPath.slice(-2) === '**') {
    const srcPrefix = srcPath.slice(0, -2)
    const { length: l } = srcPrefix
    return route =>
      route.path.slice(0, l) === srcPrefix ? [srcPrefix, route] : false
  } else if (srcPath.slice(-1) === '*') {
    const srcPrefix = srcPath.slice(0, -1)
    const { length: l } = srcPrefix
    return r =>
      r.path.slice(0, l) === srcPrefix && !r.path.slice(l).includes('/')
        ? [srcPrefix, r]
        : false
  }
  return route => {
    return route.path === srcPath ? [false, route] : false
  }
}
