import * as path from 'path'
import * as fs from 'fs'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import _postcss from 'rollup-plugin-postcss-hot'
import builtins from 'builtin-modules'
import svelte from 'rollup-plugin-svelte-hot'
import postcssNesting from 'postcss-nesting'
import prefixer from 'postcss-prefix-selector'
import atImport from 'postcss-import'

const production = !process.env.ROLLUP_WATCH
// const hot = !production

const postcss = opts =>
  _postcss({
    sourceMap: production ? true : 'inline',
    ...opts,
  })

const postcssPlugins = [atImport(), postcssNesting()]

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

  rollup: {
    input: 'lib/rollup-plugin.js',
    output: {
      format: 'cjs',
      file: 'rollup.js',
      sourcemap: true,
      ...(!production && {
        banner: "require('source-map-support').install();",
      }),
    },
    external: ['svelte/compiler', ...builtins],
    plugins: [
      json(), // required by express
      resolve({
        preferBuiltins: true,
      }),
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

  app: {
    input: 'src/app/index.js',
    output: {
      format: 'es',
      file: 'app.js',
      footer: "export { default as css } from './app.css.js';",
    },
    plugins: [
      svelte({
        // dev: !production,
        css: css => {
          css.write('app.css', false)
        },
        extensions: ['.svelte'],
        // hot: hot && {
        //   optimistic: true,
        //   noPreserveState: false,
        // },
      }),
      postcss({
        extract: 'app.vendor.css',
      }),
      resolve({
        mainFields: ['svelte', 'module', 'main'],
        browser: true,
        // dedupe: ['svelte', 'svelte/internal'],
        dedupe: importee =>
          importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),
      {
        async writeBundle() {
          const sources = ['app.css', 'app.vendor.css'].map(x =>
            path.resolve(__dirname, x)
          )
          const dest = path.resolve(__dirname, 'app.css.js')
          const css = (
            await Promise.all(sources.map(x => fs.promises.readFile(x, 'utf8')))
          ).join('\n')
          const js = `export default ${JSON.stringify(css)}`
          await fs.promises.writeFile(dest, js, 'utf8')
        },
      },
    ],
  },
}

export default ({ configTarget }) =>
  configTarget
    ? configTarget
        .split(',')
        .map(x => x.trim())
        .map(x => configs[x])
        .flat()
    : Object.values(configs).flat()
