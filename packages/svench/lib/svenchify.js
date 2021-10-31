import * as fs from 'fs'
import * as path from 'path'

import { pipeAsync, identity } from './util.js'
import { parseSvenchOptions } from './config.js'
import { createPluginParts } from './plugin-shared.js'
import { maybeDump } from './dump.js'
import Log from './log.js'
import {
  isSveltePlugin,
  loadSvelteConfig,
  mergeSvelteOptions,
} from './ecosystem.js'
import { importDefaultRelative, resolve } from './import-relative.cjs'

const defaultSvelteExtensions = ['.svelte']

const importSveltePluginModule = async (sveltePlugin, cwd, isModule) => {
  if (!isModule) {
    // NOTE this is what has been used historically (although it is arguably a
    // bit idiotic)
    return await importDefaultRelative(sveltePlugin, cwd)
  }
  // NOTE @sveltejs/vite-plugin-svelte exposes both main/module and a exports
  // map. `resolve` package doesn't seem to use the `exports` path, only main,
  // not even `module`. This means that when running in ESM, we must force using
  // `module` over `main` if it exists (ideal would be supporting the `exports`
  // map), or we're running into CJS/ESM conflict (especially since the legacy
  // approach aboves implies `esm` module).
  const sveltePluginFile = await resolve(sveltePlugin, {
    basedir: cwd,
    packageFilter: pkg => ({ ...pkg, main: pkg.module || pkg.main }),
  })
  return await import(sveltePluginFile)
}

const mergeExtensions = (...sources) => [
  ...new Set(
    sources
      .flat()
      .filter(Boolean)
      .map(x => path.extname(x) || x)
  ),
]

const mergePreprocessors = (...sources) => sources.flat().filter(Boolean)

const parseSvenchifyOptions = ({
  isModule = true,
  noMagic = false,
  interceptSveltePlugin = !noMagic,
  esm = !noMagic,
  forceSvelteHot = false,
  _setOptions,
  ...svench
} = {}) => ({
  svench: parseSvenchOptions(svench),
  isModule,
  noMagic,
  interceptSveltePlugin,
  esm,
  forceSvelteHot,
  _setOptions,
})

export default (defaultPresets, customizeConfig, finalizeConfig = identity) => {
  const doSvenchify = async (
    source,
    transform,
    {
      isModule,
      interceptSveltePlugin,
      esm = !isModule,
      svench,
      svench: {
        cwd,
        svelte: svelteOverrides = {},
        extensions,
        dump,
        defaultSveltePlugin,
        sveltePlugin = defaultSveltePlugin,
      },
      forceSvelteHot,
    }
  ) => {
    process.env.SVENCH = process.env.SVENCH || true

    const sveltePluginModule = await importSveltePluginModule(
      sveltePlugin,
      cwd,
      isModule
    )

    // see: https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md#100-next11
    const createPlugin =
      sveltePluginModule.svelte ||
      (sveltePluginModule.default && sveltePluginModule.default.svelte) ||
      sveltePluginModule.default ||
      sveltePluginModule

    const getConfig = async (...args) => {
      let preprocessors

      const svelteConfigFile = await loadSvelteConfig(cwd)

      const svelteOverridesWithoutPreprocess = { ...svelteOverrides }
      delete svelteOverridesWithoutPreprocess.preprocess

      const wrapSvelteConfig = (inlineConfig = {}) => {
        const mergedOptions = mergeSvelteOptions(
          svelteConfigFile,
          inlineConfig,
          svelteOverridesWithoutPreprocess
        )

        // @sveltejs/vite-plugin-svelte whines if it finds unknown props in
        // config, and it doesn't expect kit in non Kit (Svench) projects
        delete mergedOptions.kit

        preprocessors = mergePreprocessors(
          mergedOptions.preprocess,
          svelteOverrides.preprocess
        )

        const finalConfig = {
          ...mergedOptions,
          extensions:
            // if extension in overrides: replace,
            // else: merge project extensions with Svench's ones
            svelteOverrides.extensions ||
            mergeExtensions(
              mergedOptions.extensions || defaultSvelteExtensions,
              extensions
            ),
          // replace with caching / static analysis preprocessor
          preprocess: {
            markup: (...args) => parts.preprocess.pull(...args),
          },
          // force hot
          ...(forceSvelteHot && {
            hot: {
              ...mergedOptions.hot,
            },
            compilerOptions: {
              ...mergedOptions.compilerOptions,
              dev: true,
            },
          }),
        }

        maybeDump('svelte', dump, finalConfig)

        return finalConfig
      }

      const importConfig = async source => {
        if (typeof source === 'string') {
          const file = path.resolve(cwd, source)

          if (!fs.existsSync(file)) return {}

          if (isModule) {
            const svelteOptions = wrapSvelteConfig()
            const { default: loadConfigFile } = await import('./svenchify.mjs')
            return await loadConfigFile(file, {
              sveltePlugin,
              createPlugin,
              svelteOptions,
              Log,
            })
          } else {
            const { default: loadConfigFile } = await import('./svenchify.cjs')
            return await loadConfigFile(file, {
              interceptSveltePlugin,
              esm,
              wrapSvelteConfig,
              sveltePlugin,
              forceSvelteHot,
              Log,
            })
          }
        }
        return source
      }

      const ensureSveltePlugin = ({ plugins = [], ...options }) => {
        if (!plugins.some(isSveltePlugin)) {
          if (sveltePlugin) {
            Log.info('Inject svelte plugin: %s', sveltePlugin)
            plugins.unshift(createPlugin(wrapSvelteConfig()))
          } else {
            Log.warn(
              'No Svelte plugin found in config, no Svelte plugin found to inject'
            )
          }
        }
        return { ...options, plugins }
      }

      const castConfig = async source => {
        const resolved = await source
        if (typeof resolved === 'function') {
          return castConfig(resolved(...args))
        }
        return resolved
      }

      let config = await pipeAsync(
        importConfig,
        ensureSveltePlugin,
        castConfig
      )(source)

      // === Config loaded (preprocess initialized) ===

      const parts = createPluginParts({ preprocessors, ...svench })

      if (transform) {
        config = await transform(config)
      }

      config = await customizeConfig(config, parts, { wrapSvelteConfig })

      return config
    }

    return getConfig
  }

  // API:
  //
  //     svenchify('rollup.config.js', {...svenchifyOptions})
  //
  //     svenchify(configPath, transform = identity, {...svenchifyOptions})
  //     eg. svenchify('rollup.config.js', x => x.client, {...svenchifyOptions})
  //
  const parseSvenchifyArgs = args =>
    args.length === 2 ? [args[0], null, args[1]] : args

  const svenchify = (...args) => {
    const [source, transform, options = {}] = parseSvenchifyArgs(args)
    const { _setOptions, ...svenchifyOptions } = parseSvenchifyOptions({
      presets: defaultPresets,
      ...options,
    })
    if (_setOptions) {
      _setOptions(svenchifyOptions.svench)
    }
    const getConfig = doSvenchify(source, transform, svenchifyOptions)
    return finalizeConfig(getConfig, svenchifyOptions)
  }

  return svenchify
}
