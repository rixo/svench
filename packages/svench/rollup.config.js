import * as path from 'path'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import _postcss from 'rollup-plugin-postcss-hot'
import svelte from 'rollup-plugin-svelte-hot'
import { terser } from 'rollup-plugin-terser'
import postcssNesting from 'postcss-nesting'
import prefixer from 'postcss-prefix-selector'
import atImport from 'postcss-import'
import colorFunction from 'postcss-color-function'
import builtins from 'builtins'

import pkg from './package.json'
import { makeSvenchConfig } from './rollup.config.svench.js'

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

  app: {
    input: 'src/app/index.js',
    output: {
      format: 'es',
      file: 'app.js',
    },
    external: [/^svelte(\/|$)/],
    plugins: [
      svelte({
        emitCss: false,
        compilerOptions: { dev: !production },
        hot: !production,
      }),
      resolve({
        mainFields: ['svelte', 'module', 'main'],
        browser: true,
        // dedupe: ['svelte', 'svelte/internal'],
        dedupe: importee =>
          importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),
      production && terser(),
    ],
  },

  // === Prebuilt Svench ===
  //
  // Benefits:
  // - lightning fast cold start
  // - Svench components build is not dependent of user's config
  //
  // Drawbacks:
  // - Svelte dev components not compatible with non dev components, so we
  //   need to build both versions to support both dev and non dev for user
  // - we can anticipate that components built with a given version of Svelte
  //   will most probably not be compatible with other (at least all/any other)
  //   version of Svelte
  //
  // The drawbacks are pretty severe, unfortunately, but compiling Svench
  // components with user's build setup is hugely fragile and very limiting
  // regarding what we can do with Svench components (for example,
  // svelte-preprocess can change default language for script, style or markup,
  // which would break Svench components that expect default JS/CSS/HTML...).
  // And so, given it is possible to circumvent this limitation, even if it's
  // pretty costly, this seems like this is the right thing to do.
  //
  // The most annoying problem is support of all existing Svelte versions...
  // This might need to provide pre-built Svench for every Svelte version. This
  // will be a bit of work. Eventually, we should probably have some sort of
  // repository from which we'd download prebuilt versions as needed by user
  // setup. For now, we're going to pack every latest versions directly in the
  // Svench package, and we'll see how to make this better when the need becomes
  // pressing -- or free time suddenly appear...
  //
  svench: makeSvenchConfig({
    file: mode => `index.${mode}.js`,
    minify: !process.env.ROLLUP_WATCH,
    svelte,
  }),
}

export default ({ configTarget }) =>
  configTarget
    ? configTarget
        .split(',')
        .map(x => x.trim())
        .map(x => configs[x])
        .flat()
    : Object.values(configs).flat()
