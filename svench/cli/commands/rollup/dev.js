import path from 'path'
import relative from 'require-relative'

const isPromise = x => x && typeof x.then === 'function'

const resolveConfig = async x =>
  isPromise(x)
    ? resolveConfig(await x)
    : typeof x === 'function'
    ? resolveConfig(x())
    : x

export default async ({ cwd, _nollup, ...options }) => {
  process.env.ROLLUP_WATCH =
    process.env.ROLLUP_WATCH == null ? '1' : process.env.ROLLUP_WATCH

  if (_nollup) {
    process.env.NOLLUP = process.env.NOLLUP == null ? '1' : process.env.NOLLUP
  }

  const rel = x => relative(x, cwd)

  const { svenchify } = rel('svench/rollup')

  const configFile = path.resolve(cwd, 'rollup.config.js')

  let svenchOptions

  const rawConfig = svenchify(configFile, {
    _setOptions: x => {
      svenchOptions = x
    },
    enabled: true,
    watch: true,
    ...options,
    presets: [
      'svench/presets/rollup',
      'svench/presets/rollup-svenchify',
      ...(options.presets || []),
    ].filter(Boolean),
  })

  const { publicDir, distDir } = svenchOptions

  const config = await resolveConfig(rawConfig)

  if (_nollup) {
    const nollup = rel('nollup/lib/dev-server.js')
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
    const rollup = rel('rollup')
    rollup.watch(config)
  }
}
