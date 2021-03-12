import path from 'path'
import { test } from 'zorax'

import { resolveOptions } from './config.js'

test('sanity', t => {
  t.ok(typeof resolveOptions === 'function', 'resolveOptions is a function')
})

test('does not parse same options twice', t => {
  const o = { name: 'foo' }
  const o2 = resolveOptions(o)
  t.notEq(o !== o2, 'unknown options object is parsed')
  const o3 = resolveOptions(o2)
  t.ok(o2 === o3, 'already parsed options object is returned as is')
})

test('enrich options from env', t => {
  const { DUMP, NOLLUP } = process.env
  {
    process.env.NOLLUP = '0'
    process.env.DUMP = 'ENV_DUMP' + Math.random()
    const parsed = resolveOptions({})
    t.eq(parsed.dump, process.env.DUMP, 'resolves process.env.DUMP')
    t.eq(parsed.isNollup, false, 'parse falsy process.env.NOLLUP')
  }
  {
    process.env.NOLLUP = '1'
    const parsed = resolveOptions({})
    t.eq(parsed.isNollup, true, 'parse truthy process.env.NOLLUP')
  }
  // restore env
  process.env.NOLLUP = NOLLUP
  process.env.DUMP = DUMP
})

test('default cwd', t => {
  {
    const parsed = resolveOptions({})
    t.eq(
      parsed.cwd,
      process.cwd(),
      'options.cwd is resolved to process.cwd() by default'
    )
  }
  {
    const cwd = 'C:\\wherever'
    const parsed = resolveOptions({ cwd })
    t.eq(parsed.cwd, cwd, 'custom cwd can be passed')
  }
})

test('presets can be a simple function', t => {
  const pre = t.spy(({ svenchDir = 'das_root', ...options }) => ({
    ...options,
    svenchDir,
  }))
  const options = { presets: pre }
  const parsed = resolveOptions(options)
  pre.wasCalled()
  t.eq(path.basename(parsed.svenchDir), 'das_root')
})

test('presets: can return a partial config', t => {
  const presets = [
    () => ({ md: '.mdxxx' }),
    () => ({ foo: 42 }),
    () => ({ bar: 43 }),
  ]
  const parsed = resolveOptions({ presets })
  t.eq(parsed.md, '.mdxxx')
  t.eq(parsed._.foo, 42)
  t.eq(parsed._.bar, 43)
})

test('presets: merge can return a partial config', t => {
  const merge = t.spy((a, b) => ({
    merged: { ...a, ...b },
  }))
  const presets = [
    { merge },
    options => ({
      ...options,
      port: 42421,
    }),
  ]
  const parsed = resolveOptions({ presets })
  merge.wasCalled()
  t.eq(parsed.port, 42421)
  t.eq(parsed._.merged.port, 42421)
})

test('presets: automerge index, manifest, and serve', t => {
  const presets = [
    () => ({
      index: true,
      manifest: { foo: 'bar' },
      serve: { bar: 'baz' },
    }),
    () => ({
      index: { foofoo: 'babar' },
      manifest: false,
    }),
    () => ({
      index: { write: false },
      serve: { bazz: 'barr' },
    }),
  ]
  const parsed = resolveOptions({ presets })
  t.eq(parsed.index, { foofoo: 'babar', write: false })
  t.eq(parsed.manifest, false)
  t.eq(parsed.serve.bar, 'baz')
  t.eq(parsed.serve.bazz, 'barr')
})
