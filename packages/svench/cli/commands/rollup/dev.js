import path from 'path'

import { svenchify } from '../../../lib/rollup-plugin.js'
import { Log } from '../../lib.js'

const isPromise = x => x && typeof x.then === 'function'

const resolveConfig = async x =>
  isPromise(x)
    ? resolveConfig(await x)
    : typeof x === 'function'
    ? resolveConfig(x())
    : x

const ensureCommonDeps = info => {
  if (!info.rollup) {
    throw new Error('Missing dep: rollup')
  }
  if (!info.rollup.sveltePluginPath) {
    throw new Error('Failed to find Svelte plugin for Rollup')
  }
}

const loadNollup = async info => {
  ensureCommonDeps(info)
  if (!info.rollup.deps.nollup) {
    throw new Error('Missing dep: nollup')
  }
  if (!info.rollup.deps.nollup.devServer) {
    throw new Error('Failed to detect Nollup devServer')
  }
  const { default: nollup } = await import(info.rollup.deps.nollup.devServer)
  return nollup
}

const loadRollup = async info => {
  ensureCommonDeps(info)
  if (!info.rollup.rollupPath) {
    throw new Error('Missing dep: rollup')
  }
  const { default: rollup } = await import(info.rollup.rollupPath)
  return rollup
}

export default async (info, { _nollup, ...options }) => {
  process.env.ROLLUP_WATCH =
    process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH

  if (_nollup) {
    process.env.NOLLUP = process.env.NOLLUP == null ? '1' : process.env.NOLLUP
  }

  const configFile = info.rollup.config.exists && info.rollup.config.path

  let svenchOptions

  const {
    standalone,
    app: { type },
    rollup: { sveltePlugin: defaultSveltePlugin = 'rollup-plugin-svelte-hot' },
    svench: { dir: svenchPath },
    svelte: { dir: sveltePath, compiler: svelteCompiler } = {},
  } = info

  const rawConfig = svenchify(configFile, {
    _setOptions: options => {
      svenchOptions = options
    },
    enabled: true,

    standalone,
    svenchPath,
    sveltePath,
    svelteCompiler,

    isModule: type === 'module',
    defaultSveltePlugin,
    // enforce hot mode (@svitejs/vite-plugin-svelte doesn't do auto hot)
    forceSvelteHot: true,
    svelte: { emitCss: false },
    watch: true,
    ...options,
  })

  const { cwd, publicDir, distDir } = svenchOptions

  const config = await resolveConfig(rawConfig)

  if (_nollup) {
    const nollup = await loadNollup(info)
    nollup({
      // NOTE Nollup's defaults bellow
      contentBase: './',
      historyApiFallback: false,
      verbose: false,
      hmrHost: undefined,
      https: false,
      config,
      // ok, you won't believe this...
      //
      // .nolluprc is overridding our config:
      // https://github.com/PepsRyuu/nollup/blob/24eb04042aad5c364b6834fdd4e65548a0e1232f/lib/dev-server.js#L16
      // and so it's trying to load rollup.config.svench.js (already svenchified,
      // so problems...) in the example project
      //
      // this thing is the only hook of sort I've found to tamper with the
      // config _after_ nolluprc has polluted it:
      // https://github.com/PepsRyuu/nollup/blob/24eb04042aad5c364b6834fdd4e65548a0e1232f/lib/dev-server.js#L21
      //
      // needless to say this is insane and might explode at any moment :-x
      //
      before() {
        this.config = config
      },
      // our overrides
      // TODO this shouldn't all be hardcodded, right?
      port: 42421,
      hot: true,
      publicPath: path.relative(publicDir, distDir),
    })
  } else {
    const rollup = await loadRollup(info)

    const formatFiles = file => {
      if (!file) return
      if (Array.isArray(file)) return file.map(formatFiles).join(', ')
      return path.relative(cwd, file)
    }

    rollup.watch(config).on('event', event => {
      switch (event.code) {
        case 'BUNDLE_START':
          Log.info(
            'Rollup: bundles %s -> %s',
            formatFiles(event.input),
            formatFiles(event.output)
          )
          break

        case 'BUNDLE_END':
          Log.info(
            'Rollup: created %s in %sms',
            formatFiles(event.output),
            event.duration
          )
          break
      }
    })
  }
}
