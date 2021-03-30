import { test } from 'zorax'

import { parseSvenchOptions } from '../lib/config.js'

import vitePreset from './vite.cjs'

const { viteOption } = vitePreset

test('merge aliases', t => {
  const parsed = parseSvenchOptions({
    presets: [
      viteOption,
      () => ({
        vite: {
          resolve: {
            foo: 'bar',
            alias: {
              '/foo': './foo',
            },
          },
        },
      }),
      () => ({
        vite: {
          resolve: {
            foo: 'bar',
            alias: [{}, {}],
          },
        },
      }),
      () => ({
        vite: {
          resolve: {
            foo: 'bar',
            alias: {
              '/bar': './bar',
            },
          },
        },
      }),
    ],
  })
  t.eq(parsed.vite.resolve.foo, 'bar', 'resolve prop is not overwritten')
  t.eq(parsed.vite.resolve.alias.length, 4, 'alias are accumulated')
})
