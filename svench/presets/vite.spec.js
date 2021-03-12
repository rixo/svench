import { test } from 'zorax'

import { resolveOptions } from '../lib/config.js'

import { viteConfigMerger } from './vite.js'

test('merge aliases', t => {
  const parsed = resolveOptions({
    presets: [
      viteConfigMerger,
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
