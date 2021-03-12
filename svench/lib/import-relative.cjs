/**
 * Workaround for lack of sync ES import... (Will that keep working in a full
 * ESM environment?)
 *
 * Needs to be CJS for require('esm') to work.
 */
const _resolve = require('resolve')

const relative = require('require-relative')

const importSync = require('esm')(module)

const importRelative = (id, to = process.cwd()) => {
  const url = relative.resolve(id, to)
  return importSync(url)
}

const importDefaultRelative = (id, to) => {
  const m = importRelative(id, to)
  return m.default || m
}

const resolve = async (...args) =>
  await new Promise((res, rej) =>
    _resolve(...args, (err, result) => {
      if (err) rej(err)
      else res(result)
    })
  )

const resolveSync = _resolve.sync

module.exports = {
  importSync,
  importRelative,
  importDefaultRelative,
  resolve,
  resolveSync,
}
