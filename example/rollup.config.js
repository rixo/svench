import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import hmr, { autoCreate } from 'rollup-plugin-hot'
import { mdsvex } from 'mdsvex'
import svench from 'svench/rollup'

// NOTE The NOLLUP env variable is picked by various HMR plugins to switch
// in compat mode. You should not change its name (and set the env variable
// yourself if you launch nollup with custom comands).
const nollup = !!process.env.NOLLUP
const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const hot = watch && !useLiveReload
const enableSvench = !!process.env.SVENCH

const spa = false || enableSvench

export default {
  input: 'src/main.js',
  // output: {
  //   sourcemap: true,
  //   format: 'iife',
  //   name: 'app',
  //   file: 'public/build/bundle.js',
  // },
  output: {
    sourcemap: true,
    format: 'esm',
    dir: 'public/build',
  },
  plugins: [
    enableSvench &&
      svench.rollup({
        pages: './src',
        extensions: ['.svench', '.svench.svelte', '.svench.svx'],
      }),

    postcss({}),

    svelte({
      // Enable run-time checks when not in production
      dev: !production,
      // We'll extract any component CSS out into a separate file — better for
      // performance
      css: css => {
        css.write('public/build/bundle.css')
      },
      extensions: ['.svelte', '.svench', '.svx', '.svhx'],
      preprocess: [
        mdsvex({
          extension: '.svx',
        }),
        // preprocessor is only needed to automatically extracts source code
        // from View components
        svench.preprocess({
          extensions: ['.svench', '.svench.svx'],
        }),
      ],
      hot: hot && {
        // Optimistic will try to recover from runtime
        // errors during component init
        optimistic: true,
        // Turn on to disable preservation of local component
        // state -- i.e. non exported `let` variables
        noPreserveState: false,

        // See docs of rollup-plugin-svelte-hot for all available options:
        //
        // https://github.com/rixo/rollup-plugin-svelte-hot#usage
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      // routify uses svelte
      mainFields: ['svelte', 'module', 'main'],
      dedupe: ['@sveltech/routify', 'svelte'],
      // rollup-plugin-svelte-hot automatically resolves & dedup svelte
    }),
    commonjs(),

    // In dev mode, call `npm run start:dev` once
    // the bundle has been generated
    dev && !nollup && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    useLiveReload && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    // Automatically create missing imported files. This helps keeping
    // the HMR server alive, because Rollup watch tends to crash and
    // hang indefinitely after you've tried to import a missing file.
    // hot &&
    //   autoCreate({
    //     include: 'src/**/*',
    //     // Set false to prevent recreating a file that has just been
    //     // deleted (Rollup watch will crash when you do that though).
    //     recreate: true,
    //   }),

    hmr({
      public: 'public',
      inMemory: true,
      // This is needed, otherwise Terser (in npm run build) chokes
      // on import.meta. With this option, the plugin will replace
      // import.meta.hot in your code with module.hot, and will do
      // nothing else.
      compatModuleHot: !hot,
    }),
  ],
  watch: {
    clearScreen: false,
  },
}

function serve() {
  let started = false
  return {
    name: 'svelte/template:serve',
    writeBundle() {
      if (!started) {
        started = true
        const flags = ['run', 'start', '--', '--dev']
        if (spa) {
          flags.push('--single')
        }
        if (enableSvench) {
          flags.push('--port 4242')
        }
        require('child_process').spawn('npm', flags, {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}
