import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import hmr, { autoCreate } from 'rollup-plugin-hot'
import { mdsvex } from 'mdsvex'
import { routify } from '@sveltech/routify'
// import Svench from 'svench'

// NOTE The NOLLUP env variable is picked by various HMR plugins to switch
// in compat mode. You should not change its name (and set the env variable
// yourself if you launch nollup with custom comands).
const nollup = !!process.env.NOLLUP
const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || useLiveReload
const production = !dev

const hot = watch && !useLiveReload
const svench = !!process.env.SVENCH

const spa = false || svench

const updateChildrenPath = (file, oldPath) => {
  if (file.filepath === oldPath) return
  if (!file.dir) return
  for (const child of file.dir) {
    const { filepath } = child
    child.filepath = file.filepath + filepath.slice(oldPath.length)
    updateChildrenPath(child, filepath)
  }
}

const isMagic = route =>
  route.isIndex || route.isLayout || route.isReset || route.isFallback

const relocateVirtualFiles = (file, parent) => {
  const { segments: segs } = file

  if (segs) {
    delete file.segments
    file.name = segs.pop()
    file.file = file.name + (file.ext ? `.${file.ext}` : '')
    file.svench.extraNesting = segs.length
    file.svench.isVirtualIndex = true

    if (!parent.dir) {
      throw new Error('unexpected hierarchy')
    }

    parent.dir = parent.dir.filter(x => x !== file)

    let cur = parent

    while (segs.length > 0) {
      const seg = segs.shift()
      const nextParent = cur.dir.find(x => x.dir && !x.ext && x.name === seg)
      if (nextParent) {
        cur = nextParent
      } else {
        const dir = cur.dir
        cur = {
          file: seg,
          filepath: (cur.filepath || '') + '/' + seg,
          name: seg,
          ext: '',
          badExt: false,
          dir: [],
          // absolutePath: '/home/eric/projects/routify/svench/svench/example/src/000',
          // dir: [
          //   {
          //     file: 'index.svench',
          //     filepath: '/000/index.svench',
          //     name: 'index',
          //     ext: 'svench',
          //     badExt: false,
          //     absolutePath: '/home/eric/projects/routify/svench/svench/example/src/000/index.svench',
          //     svench: {}
          //   }
          // ],
          svench: {}
        }
        dir.push(cur)
      }
    }

    cur.dir.push(file)
    file.filepath = cur.filepath + '/' + file.file
  }

  if (file.dir) {
    for (const child of file.dir) {
      relocateVirtualFiles(child, file)
    }
  }

  return file
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svench &&
      routify({
        pages: './src',
        // TODO routify should accept '.svench'
        extensions: ['svench', 'svench.svx'],
        // watch delay is needed to prevent race:
        //
        // - user rename/delete page file
        // - rollup picks file change
        // - rollup triggers build
        // - rollup-plugin-hot/autocreate sees deleted file in routes.js
        // - autocreate recreates just deleted file <--- HERE BE BUG
        // - routify picks file change
        // - routify recreates routes.js
        // - ... but too late, user has extraneous deleted file recreated
        // - rollup picks the change in routes.js...
        //
        // this delay is intented to give some time to routify to pick the
        // change first (and so rollup plugin will block start of rollup build
        // until routes.js has been generated)
        //
        // we can't be too greedy, because this delay will be paid for _any_
        // file change when user is working, even when unneeded (and in this
        // case the delay will be consumed in full -- nominal case is worst
        // case) :-/
        //
        watchDelay: 20,
        // remove .svench suffix from directories
        // filepathToUrl: (file, prev) =>
        //   prev(file).replace(/\.svench(?=\/|$)/g, ''),
        hooks: {
          file(file) {
            file.svench = {
              extraNesting: 0,
            }

            const { filepath: oldFilepath } = file

            // remove .svench from dir
            if (file.dir && file.name.endsWith('.svench')) {
              const dropSvench = x => x.replace(/\.svench$/g, '')
              file.name = dropSvench(file.name)
              file.filepath = dropSvench(file.filepath)
              if (file.ext) {
                file.ext = file.ext.replace(/^svench$/g, '')
              }
              updateChildrenPath(file, oldFilepath)
            }

            // . => /
            const segs = file.name.split('.')
            if (segs.length > 1) {
              delete file.name
              file.segments = segs
            }
          },
          tree: relocateVirtualFiles,
          decorate: (file, parent) => {
            const svench = file.svench

            let basename = file.path.split('/').pop()

            if (!isMagic(file) && !/^[\d-]*$/.test(basename)) {
              const match = /^[\d-]+(.*)$/.exec(basename)
              if (match) {
                basename = match[1]
              }
            }

            svench.sortKey = basename

            if (parent.path) {
              file.path = parent.path + '/' + basename
            } else {
              file.path = '/' + basename
            }
          },
        },
      }),
    svelte({
      // Enable run-time checks when not in production
      dev: !production,
      // We'll extract any component CSS out into a separate file — better for
      // performance
      // NOTE extracting CSS doesn't work with HMR, so we're inlining when hot
      ...(!hot && {
        css: css => {
          css.write('public/build/bundle.css')
        },
      }),
      extensions: ['.svelte', '.svench', '.svx', '.svhx'],
      preprocess: [
        mdsvex({
          extension: '.svx',
        }),
        mdsvex({
          extension: '.svhx',
        }),
        // Svench({
        //   extensions: ['.svench', '.svench.svx'],
        // }),
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
        if (svench) {
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
