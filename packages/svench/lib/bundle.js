/**
 * Util to compile & bundle Svench runtime with a specific Svelte version.
 *
 * Under the hood, uses Rollup and rollup-plugin-svelte-hot (that allows to use
 * custom Svelte compiler).
 *
 * This is needed for:
 *
 * - fast cold start of Svench (avoid compiling & bundling all of Svench
 *   components)
 *
 * - isolate Svench components build config from user's config
 *
 * === Prebuilt Svench ===
 *
 * Benefits:
 * - lightning fast cold start
 * - Svench components build is not dependent of user's config
 *
 * Drawbacks:
 * - Svelte dev components not compatible with non dev components, so we
 *   need to build both versions to support both dev and non dev for user
 * - we can anticipate that components built with a given version of Svelte
 *   will most probably not be compatible with other (at least all/any other)
 *   version of Svelte
 *
 * The drawbacks are pretty severe, unfortunately, but compiling Svench
 * components with user's build setup is hugely fragile and very limiting
 * regarding what we can do with Svench components (for example,
 * svelte-preprocess can change default language for script, style or markup,
 * which would break Svench components that expect default JS/CSS/HTML...).
 * And so, given it is possible to circumvent this limitation, even if it's
 * pretty costly, this seems like this is the right thing to do.
 *
 * The most annoying problem is support of all existing Svelte versions...
 * This might need to provide pre-built Svench for every Svelte version. This
 * will be a bit of work. Eventually, we should probably have some sort of
 * repository from which we'd download prebuilt versions as needed by user
 * setup. For now, we're going to pack every latest versions directly in the
 * Svench package, and we'll see how to make this better when the need becomes
 * pressing -- or free time suddenly appear...
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { rollup } from 'rollup'

import Log from './log.js'
import { fileExists, importAbsolute } from './util.js'
import { getRuntimeFilename } from './bundle.util.cjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const root = path.resolve(__dirname, '..')

const configFile = path.resolve(root, 'rollup.config.runtime.js')

export const bundleRuntime = async ({
  target = ['svench', 'app'],
  svenchVersion,
  svelteCompilerPath,
  svelteCompiler,
  minify = true,
  prod = null,
}) => {
  if (!svelteCompiler && svelteCompilerPath) {
    svelteCompiler = await importAbsolute(svelteCompilerPath)
  }

  const start = Date.now()

  Log.log(
    'Compiling Svench %s runtime with Svelte %s (%s)...',
    svenchVersion,
    svelteCompiler.VERSION,
    prod === true ? 'prod' : prod === false ? 'dev' : 'prod, dev'
  )

  const { makeSvenchConfig } = await importAbsolute(configFile)

  const configs = makeSvenchConfig(target, {
    svenchVersion,
    svelteCompiler,
    getRuntimeFilename,
    minify,
    prod,
  })

  const cwd = process.cwd()
  process.chdir(root)

  await Promise.all(
    configs.map(async ({ output, ...options }) => {
      const bundle = await rollup(options)
      await bundle.write(output)
      Log.info('Written: %s', output.file)
    })
  )

  process.chdir(cwd)

  Log.log(
    'Compiled Svench runtime in %ss',
    ((Date.now() - start) / 1000).toFixed(2)
  )
}

export const ensureRuntime = async ({
  svenchVersion,
  svelteVersion,
  svelteCompilerPath,
  prod,
  force,
}) => {
  if (!force) {
    const mode = prod ? 'prod' : 'dev'

    const existsByFile = await Promise.all(
      ['svench', 'app'].map(async name => {
        const file = getRuntimeFilename(name, {
          svenchVersion,
          svelteVersion,
          mode,
        })
        const exists = await fileExists(path.join(root, file))
        const logMessage = exists
          ? 'Found runtime: %s'
          : 'Runtime not found: %s'
        Log.debug(logMessage, file)
        return exists
      })
    )

    if (existsByFile.every(Boolean)) {
      Log.info(
        'Found complete runtime for Svench %s with Svelte %s',
        svenchVersion,
        svelteVersion
      )
      return
    }
  }

  await bundleRuntime({ svenchVersion, svelteCompilerPath, prod })
}
