/* eslint-env node */
import * as path from 'path'
import { svenchify } from 'svench/rollup'
import postcss from 'rollup-plugin-postcss-hot'
import del from 'rollup-plugin-delete'
import replace from '@rollup/plugin-replace'

const watch = !!process.env.ROLLUP_WATCH
const useLiveReload = !!process.env.LIVERELOAD
const hot = watch && !useLiveReload

const svenchDir = path.resolve(process.env.SVENCH_DIR || '.svench')
const port = process.env.SVENCH_PORT || 4242
const manifestDir = svenchDir && path.join(svenchDir, 'tmp')
const svenchDist = process.env.SVENCH_DIR
  ? path.join(process.env.SVENCH_DIR, 'tmp/dist')
  : '.svench/dist'

export default svenchify('./rollup.config.js', {
  // The root dir that Svench will parse and watch.
  svenchDir,

  svelte: {
    // TODO this is legacy plugin API
    css: css => {
      css.write(path.join(svenchDist, 'bundle.css'))
    },
  },

  // Example: code splitting with ES modules
  override: {
    // replace input with a Svench entry point (here a custom one)
    // input: '.svench/svench.js',
    input: true,

    output: {
      // change output format to ES module
      format: 'es',
      // remove the file from the original config (can't have file & dir)
      file: null,
      // and change to a dir (code splitting outputs multiple files)
      dir: svenchDist,
      // ensure we know the name of our entry point (useful when input file is
      // not named svench.js)
      entryFileNames: 'svench.js',
    },

    plugins: plugins => [
      // NOTE del is needed to avoid serving stale static files that would
      // shadow Nollup's in-memory files
      del({ targets: '.svench/dist/*', runOnce: true }),
      manifestDir &&
        replace({
          delimiters: ['', ''],
          "'./tmp/routes.js'": JSON.stringify(
            path.resolve(manifestDir, 'routes.js')
          ),
        }),
      ,
      ...plugins,
      postcss({ hot }),
    ],
  },

  index: {
    source: 'public/index.html',
    // NOTE we need to add type="module" to use script in ES format
    replace: {
      '<script defer src="/build/bundle.js">':
        '<script defer type="module" src="/svench.js">',
      '/build/bundle.css': '/bundle.css',
      'Svelte app': 'Svench app',
    },
    // write: '.svench/dist/index.html',
  },

  serve: {
    host: '0.0.0.0',
    port,
    public: [svenchDist, 'public'],
    nollup: { port: `${port}1` },
  },
})
