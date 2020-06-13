// TODO escape regex
const escapeRe = x => x

export const matchPath = (resolveCanonical, src) => {
  const srcPath = resolveCanonical(src)

  // TODO real glob / wildcard support...
  let srcPrefix = false
  const suffix = '?$'

  if (srcPath.slice(-2) === '**') {
    srcPrefix = srcPath.slice(0, -2)
  } else if (srcPath.slice(-1) === '*') {
    srcPrefix = srcPath.slice(0, -1)
  }

  const sortKey = '[-\\d]*_*'
  const weakStar = '[^/]+'
  const rockStar = '.*'
  const any = '.'
  // TODO escape user provided regex parts
  const regex =
    '^' +
    [
      ...srcPath.split('/').map(segment => {
        let x = segment
        if (!x) return x
        x = escapeRe(x)
        x = x
          .split('**')
          .map(xx => xx.replace('*', weakStar))
          .join(rockStar)
        x = x.replace('?', any)
        if (!/^[-\d]+/.test(segment)) x = sortKey + x
        return x
      }),
      suffix,
    ].join('/')

  // console.log('regex', srcPath, regex)

  return route => {
    if (!route.canonical.match(regex)) return false
    return [srcPrefix, route]
  }
}
