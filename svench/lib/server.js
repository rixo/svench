import * as fs from 'fs'
import * as path from 'path'
import Sirv from 'sirv'
import restana from 'restana'
import httpProxy from 'http-proxy'
import Log from './log.js'

const parseMount = x => {
  if (typeof x === 'string') return { base: '/', dir: x }
  return { base: '/', ...x }
}

export default (options, { mountEntry, isNollup }) => {
  const {
    public: dir,
    host,
    port,
    index: customIndex,
    encoding = 'utf8',
    nollup,
  } = options

  let resolveStarted
  const startedPromise = new Promise(resolve => {
    resolveStarted = resolve
  })

  const waitStarted = (req, res, next) => {
    return startedPromise.then(next).catch(next)
  }

  const sourceDirs = !dir ? [] : Array.isArray(dir) ? dir : [dir]

  const dirs = sourceDirs.map(x => (x && x.dir) || x)

  Log.info(`Serving from ${dirs.map(() => '%s*').join(', ')}`, ...dirs)

  let serveIndex

  const defaultRoute = (req, res, next) => {
    if (/\btext\/html\b/.test(req.headers['accept'])) {
      return serveIndex(req, res)
    } else if (next) {
      next()
    } else {
      res.send(404)
    }
  }

  const cleaners = []

  const app = restana({
    defaultRoute,
    errorHandler: (err, req, res) => {
      Log.error(err)
      res.send(err)
    },
  })

  cleaners.push(() => app.close())

  app.use(waitStarted)

  const readyPromise = app
    .start(port, host)
    .then(() => {
      Log.log(`Listening on http://${host}:${port}`)
    })
    .catch(err => {
      Log.error(err)
      throw err
    })

  const start = ({ getIndex, entryFile }) => {
    const findIndex = () => {
      for (const dir of dirs) {
        const filename = path.resolve(dir, customIndex || 'index.html')
        if (fs.existsSync(filename)) {
          return filename
        }
      }
    }

    const _getIndex =
      getIndex || (() => fs.promises.readFile(findIndex(), encoding))

    serveIndex = (req, res) => {
      Promise.resolve(_getIndex())
        .then(index => {
          res.setHeader('Content-Type', 'text/html')
          res.end(index)
        })
        .catch(err => {
          Log.error('Failed to get index contents', err)
          res.writeHead(500)
        })
    }

    app
      .get('/', serveIndex)
      .get('/index.html', serveIndex)
      .get('/index', serveIndex)

    if (mountEntry) {
      app.get(mountEntry, async (req, res) => {
        res.setHeader('Content-Type', 'text/javascript')
        res.end(await fs.promises.readFile(entryFile, encoding))
      })
    }

    const mounts = sourceDirs.map(parseMount)

    for (const { base, dir } of mounts) {
      Log.info('mount %s => %s*', base, dir)
      const sirv = Sirv(dir, { dev: true })
      const getPath = req =>
        base === req.url ? base : req.url.slice(base.length)
      app.use(base, (req, res, next) => {
        sirv({ ...req, path: getPath(req) }, res, next)
      })
    }

    app.use('*', (req, res, next) => {
      defaultRoute(req, res, next)
    })

    if (nollup && isNollup) {
      const splitTarget = spec => {
        if (typeof spec === 'string') {
          const parts = spec.split(':')
          return { host: parts.shift(), port: +parts.shift() }
        }
        return { host: 'localhost', port: 8080, ...spec }
      }

      const target = splitTarget(nollup)
      const proxy = httpProxy.createProxyServer({ target })

      const mountDir = target.mount ? target.mount.replace(/[/*]*$/, '') : ''
      const route = mountDir + '*'

      Log.info(`Proxying to Nollup ${route} => ${target.host}:${target.port}`)

      // app.all(route, proxy.web.bind(proxy))
      app.all(route, (req, res) => {
        req.path = req.url = req.path.substr(mountDir.length)
        req.url = req.path
        proxy.web(req, res)
      })
      app.getServer().on('upgrade', proxy.ws.bind(proxy))
    }

    resolveStarted()
  }

  const ready = () => Promise.all([readyPromise, startedPromise])

  const close = () => Promise.all(cleaners.map(async fn => fn()))

  return { start, ready, close }
}
