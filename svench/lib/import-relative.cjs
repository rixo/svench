/**
 * Workaround for lack of sync ES import... (Will that keep working in a full
 * ESM environment?)
 *
 * Needs to be CJS for require('esm') to work.
 */

const relative = require('require-relative')

export const importSync = require('esm')(module)

export const importRelative = (id, to = process.cwd()) => {
  const url = relative.resolve(id, to)
  return importSync(url)
}

export const importDefaultRelative = (id, to) => {
  const m = importRelative(id, to)
  return m.default || m
}
