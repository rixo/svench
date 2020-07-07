/* eslint-env node */

/**
 * This is used for tests.
 */

if (!process.env.ROLLUP_WATCH) {
  process.env.ROLLUP_WATCH = 'true'
}

if (!process.env.NOLLUP) {
  process.env.NOLLUP = 'true'
}

const fs = require('fs')
const path = require('path')
const express = require('express')
// const fallback = require('express-history-api-fallback')
const proxy = require('express-http-proxy')
const nollupDevMiddleware = require('nollup/lib/dev-middleware')
const ConfigLoader = require('nollup/lib/impl/ConfigLoader')

const watch = (config, options) => {
  if (!options) {
    options = fs.existsSync('.nolluprc')
      ? Object.assign({}, JSON.parse(fs.readFileSync('.nolluprc')))
      : fs.existsSync('.nolluprc.js')
      ? Object.assign(
          {},
          require(path.resolve(process.cwd(), './.nolluprc.js'))
        )
      : {
          hot: true,
          port: 3333,
        }
  }

  const changeListeners = []
  const bundleListeners = []

  const on = (event, fn) => {
    if (event === 'change') changeListeners.push(fn)
    else if (event === 'event') bundleListeners.push(fn)
    else throw new Error('Unsupported event: ' + event)
  }

  const notify = listeners => (...args) => listeners.forEach(fn => fn(...args))

  const notifyChange = notify(changeListeners)
  const notifyBundle = notify(bundleListeners)

  const onBundle = (...args) => on('event', ...args)

  const app = express()

  app.use(
    nollupDevMiddleware(
      app,
      config,
      {
        ...options,
        onChange: notifyChange,
        onBundle: notifyBundle,
      }
    )
  )

  app.use(express.static(options.contentBase || 'static'))

  app.use(proxy('localhost:3000'))

  const server = app.listen(options.port)

  // eslint-disable-next-line no-console
  console.log(
    `[Nollup] Listening on http://${options.hmrHost || 'localhost'}:${
      options.port
    }`
  )

  const close = () => server.close()

  return { on, close, onBundle }
}

module.exports = { watch }

const resolveConfig = async config => {
  const next = await config
  if (typeof next === 'function') return resolveConfig(next())
  if (Array.isArray(next)) {
    if (next.length > 1) throw new Error('Unsupported config format')
    return resolveConfig(next[0])
  }
  return next
}

const loadConfig = async file => {
  // const loadConfigFile = require('rollup/dist/loadConfigFile')
  // const { options } = await loadConfigFile(file)
  const options = await ConfigLoader.load(file)
  return await resolveConfig(options)
}

let instance

const start = async ({ rc, config: configFile }) => {
  const config = await loadConfig(configFile)
  instance = watch(config, rc)
  instance.onBundle(() => {
    process.send({ type: 'bundle' })
  })
}

const close = async () => {
  if (!instance) {
    // eslint-disable-next-line no-console
    console.error('ERROR closing non existing instance')
    return
  }
  const { close } = instance
  instance = null
  await close()
  process.exit(0)
}

const handleError = error => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(255)
}

const handlers = { start, close }

process.on('message', msg => {
  const handler = handlers[msg.type]
  return Promise.resolve(handler(msg)).catch(handleError)
})
