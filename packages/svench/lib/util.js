import * as fs from 'fs'
import * as path from 'path'

export const pipe = (...fns) => x0 => fns.reduce((x, f) => f(x), x0)

export const noop = () => {}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
export const escapeRe = string =>
  string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

export const log = {
  /* eslint-disable no-console */
  log: console.log.bind(console, '[svench]'),
  error: console.error.bind(console, '[svench]'),
  warn: console.warn.bind(console, '[svench]'),
  info: console.info.bind(console, '[svench]'),
  /* eslint-enable no-console */
}

export const mkdirp = async dir => {
  const parent = path.dirname(dir)
  if (parent === dir) return
  await mkdirp(parent)
  try {
    await fs.promises.mkdir(dir)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

export const mkdirpSync = dir => {
  const parent = path.dirname(dir)
  if (parent === dir) return
  mkdirpSync(parent)
  try {
    fs.mkdirSync(dir)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

export const isRollupV1 = () => {
  try {
    return require.main.require('rollup/package.json').version.startsWith('1.')
  } catch (err) {
    return null
  }
}
