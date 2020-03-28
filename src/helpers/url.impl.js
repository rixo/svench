const backRe = /^((?:\.\.(?:$|\/))+)(.*)$/

const trimDoubles = x => x.replace(/\/{2,}/g, '/')

export const trimIndex = x => x.replace(/(^|\/)index(\/|$)/, '$1$2')

const dirname = x => (x.endsWith('/') ? x : x.replace(/[^/]*$/, ''))

const join = (...args) => trimDoubles(args.join('/'))

const clean = path => path.replace(/\/\.\/|\/{2,}/g, '/')

const resolve = (from, _path) => {
  // foo/./bar => foo/bar
  // foo//bar => foo/bar
  const path = clean(_path)
  const match = backRe.exec(path)
  if (!match) {
    return join(from, path) || '/'
  }
  const [, prefix, suffix] = match
  const segments = from.split('/').filter(Boolean)
  let { length: i } = prefix.slice(0, -1).split('/')
  while (i--) {
    if (segments.length < 1) {
      throw new Error(
        `Cannot resolve URL outside of app context: '${path}' from '${from}'`
      )
    }
    segments.pop()
  }
  const result = join('', ...segments, suffix)
  return result === '' ? '/' : trimDoubles(result)
}

export const resolveUrl = (from, path, params, strict = false) => {
  // preprocess
  if (!strict) {
    from = trimIndex(from)
  }
  if (!from) {
    from = '/'
  }
  // process
  if (path === '') {
    return from || '/'
  }
  if (path === '.') {
    return dirname(from)
  }
  if (path.startsWith('/')) {
    return path
  }
  if (path.startsWith('./')) {
    return resolve(dirname(from), path.slice(2))
  }
  if (path.startsWith('..')) {
    return resolve(dirname(from), path)
  }
  return join(from, path)
}
