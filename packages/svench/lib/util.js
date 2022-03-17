import * as fs from 'fs'
import * as path from 'path'
import { pathToFileURL } from 'url'

export const identity = x => x

export const pipe = (...fns) => x0 => fns.reduce((x, f) => f(x), x0)

export const pipeAsync = (...fns) => async x0 => {
  let x = x0
  for (const fn of fns) {
    x = await fn(x)
  }
  return x
}

export const tap = fn => x => (fn(x), x)

export const noop = () => {}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
export const escapeRe = string =>
  string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

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

export const fileExists = async file =>
  await new Promise(resolve => fs.exists(file, resolve))

export const isRollupV1 = () => {
  try {
    return require.main.require('rollup/package.json').version.startsWith('1.')
  } catch (err) {
    return null
  }
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
// (via https://github.com/sveltejs/svelte/blob/91d758e35b2b2154512ddd11e6b6d9d65708a99e/src/compiler/compile/utils/hash.ts#L2)
export const stringHashcode = str => {
  let hash = 5381
  let i = str.length
  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i)
  return (hash >>> 0).toString(36)
}

// see: https://github.com/rixo/svench/issues/30
export const importAbsolute = async file => await import(pathToFileURL(file))

export const importDefaultAbsolute = async file => {
  const module = await importAbsolute(file)
  return module.default || module
}
