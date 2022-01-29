/**
 * Workaround for lack of sync ES import... (Will that keep working in a full
 * ESM environment?)
 *
 * Needs to be CJS for require('esm') to work.
 */
const fs = require('fs')
const _resolve = require('resolve')
const relative = require('require-relative')

// TODO completely remove 'esm', because of lacking syntax support (eg ??)
const importSync = require('esm')(module)

const possibleExtensions = id => {
  if (/\.[cm]?js$/.test(id)) return [id]
  const alts = [id, id + '.js', id + '.mjs', id + '.cjs']
  if (!id.endsWith('/index')) alts.push(...possibleExtensions(id + '/index'))
  return alts
}

const importRelative = (id, to = process.cwd()) => {
  for (const filename of possibleExtensions(id)) {
    const file = relative.resolve(filename, to)
    if (fs.existsSync(file)) {
      return importSync(file)
    }
  }
  throw new Error('Module not found: ' + id)
}

const parseResolveOptions = opts =>
  typeof opts === 'string' ? { basedir: opts } : opts

const resolve = async (target, opts) =>
  await new Promise((res, rej) =>
    _resolve(target, parseResolveOptions(opts), (err, result) => {
      if (err) rej(err)
      else res(result)
    })
  )

const resolveSync = (target, opts) =>
  _resolve.sync(target, parseResolveOptions(opts))

module.exports = {
  importSync,
  importRelative,
  resolve,
  resolveSync,
}
