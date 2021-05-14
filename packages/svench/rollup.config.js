import * as path from 'path'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import _postcss from 'rollup-plugin-postcss-hot'
import postcssNesting from 'postcss-nesting'
import prefixer from 'postcss-prefix-selector'
import atImport from 'postcss-import'
import colorFunction from 'postcss-color-function'
import builtins from 'builtins'

import pkg from './package.json'

// import * as svelteCompiler from 'svelte/compiler'
// const { getRuntimeFilename } = require('./lib/bundle.util.cjs')
// import { makeSvenchConfig } from './rollup.config.runtime.js'

const production = !process.env.ROLLUP_WATCH
// const hot = !production

const postcss = opts =>
  _postcss({
    sourceMap: production ? true : 'inline',
    ...opts,
  })

const postcssPlugins = [atImport(), postcssNesting(), colorFunction()]

const postcssMarkdownPlugins = [
  ...postcssPlugins,
  prefixer({
    prefix: '.svench-content',
    transform: (prefix, selector) => {
      if (selector.includes('svench-')) return selector
      if (selector.startsWith('.')) return prefix + selector
      return selector.replace(/^([a-z0-9]+|\S+)(.*)$/, `$1${prefix}$2`)
    },
  }),
]

const configs = {
  // {
  //   input: 'src/app.ce/index.js',
  //   output: {
  //     format: 'iife',
  //     file: 'dist/app.js',
  //     sourcemap: true,
  //   },
  //   plugins: [
  //     svelte({
  //       // dev: !production,
  //       // css: css => {
  //       //   css.write('public/build/bundle.css')
  //       // },
  //       extensions: ['.svelte'],
  //       customElement: true,
  //       // preprocess,
  //       hot: hot && {
  //         optimistic: true,
  //         noPreserveState: false,
  //       },
  //     }),
  //
  //     resolve({
  //       browser: true,
  //       dedupe: ['svelte'],
  //     }),
  //
  //     commonjs(),
  //     // production && terser(),
  //   ],
  // },

  prism: {
    input: 'src/app/prism.js',
    output: {
      format: 'iife',
      file: 'prism.js',
      name: 'SvenchPrismWithCss',
    },
    plugins: [postcss({}), resolve({ browser: true }), commonjs()],
  },

  plugins: {
    input: [
      'lib/rollup-plugin.js',
      'lib/snowpack-plugin.js',
      'lib/vite-plugin.js',
    ],
    output: {
      format: 'cjs',
      dir: '.',
      entryFileNames: ({ facadeModuleId: x }) =>
        path.basename(x).replace('-plugin', '').replace('.js', '.cjs'),
      chunkFileNames: 'dist/[name].cjs',
      sourcemap: true,
      ...(!production && {
        banner: "require('source-map-support').install();",
      }),
    },
    external: [
      'svelte/compiler',
      '@snowpack/plugin-svelte',
      // 'trouter',
      ...builtins,
      'esm',
      'svench',
      ...Object.keys(pkg.dependencies).filter(id => !id.startsWith('routix')),
    ],
    plugins: [
      json(), // required by express
      resolve({ preferBuiltins: true }),
      commonjs(),
    ],
    watch: {
      clearScreen: false,
    },
  },

  theme: [
    {
      input: 'src/themes/default.js',
      output: {
        format: 'es',
        file: 'themes/default.js',
      },
      plugins: [
        postcss({
          extract: true,
          plugins: postcssPlugins,
        }),
        {
          generateBundle(outputOptions, bundle) {
            delete bundle['default.js']
          },
        },
      ],
    },
    {
      input: 'src/themes/default.js',
      output: {
        format: 'iife',
        file: 'themes/default.css.js',
      },
      plugins: [postcss({ plugins: postcssPlugins })],
    },

    {
      input: 'src/themes/default-markdown.js',
      output: {
        format: 'es',
        file: 'themes/default-markdown.js',
      },
      plugins: [
        postcss({
          extract: true,
          plugins: postcssMarkdownPlugins,
          // modules: {
          //   generateScopedName: '[name].svench-content',
          //   generateScopedName: (name, filename, css) => {
          //     console.log('>>>', name, filename)
          //     return `svench-content-${name}`
          //   },
          // },
        }),
        {
          generateBundle(outputOptions, bundle) {
            delete bundle['default-markdown.js']
          },
        },
      ],
    },
    {
      input: 'src/themes/default-markdown.js',
      output: {
        format: 'iife',
        file: 'themes/default-markdown.css.js',
      },
      plugins: [postcss({ plugins: postcssMarkdownPlugins })],
    },
  ],

  /**
   * util-esm is prebundled legacy vendor deps to esm, in order to avoid
   * requiring from the user to have specific plugins (resolve, commonjs) in
   * their config
   */
  'util-esm': {
    input: 'src.util-esm/index.js',
    output: {
      format: 'es',
      file: 'src/util-esm.js',
      sourcemap: true,
    },
    plugins: [resolve({ browser: true }), commonjs()],
  },

  // app: makeSvenchConfig('app', {
  //   svelteCompiler: svelteCompiler,
  //   getRuntimeFilename,
  //   prod: !production,
  // }),
  //
  // svench: makeSvenchConfig('svench', {
  //   svelteCompiler: svelteCompiler,
  //   getRuntimeFilename,
  //   prod: !production,
  // }),
}

export default ({ configTarget }) =>
  configTarget
    ? configTarget
        .split(',')
        .map(x => x.trim())
        .map(x => configs[x])
        .flat()
    : Object.values(configs).flat()
