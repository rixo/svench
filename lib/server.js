import * as fs from 'fs'
import * as path from 'path'
import Sirv from 'sirv'
import restana from 'restana'
import { log } from './util'

const defaultOptions = {
  host: 'localhost',
  port: 4242,
  public: 'public',
  index: undefined,
}

const parseOptions = options => {
  if (options === true) return defaultOptions
  return { ...defaultOptions, ...options }
}

export default (options, { mountEntry }) => {
  options = parseOptions(options)

  const {
    public: dir,
    host,
    port,
    index: customIndex,
    encoding = 'utf8',
  } = options

  let resolveStarted
  const startedPromise = new Promise(resolve => {
    resolveStarted = resolve
  })

  const waitStarted = (req, res, next) => {
    return startedPromise.then(next).catch(next)
  }

  const dirs = !dir ? [] : Array.isArray(dir) ? dir : [dir]

  log.info(`Serving from ${dirs.join(', ')}`)

  let serveIndex

  const defaultRoute = (req, res) => {
    if (/\btext\/html\b/.test(req.headers['accept'])) {
      return serveIndex(req, res)
    } else {
      res.send(404)
    }
  }

  const app = restana({
    defaultRoute,
    errorHandler: (err, req, res) => {
      log.error(err)
      res.send(err)
    },
  })

  app.use(waitStarted)

  const readyPromise = app
    .start(port, host)
    .then(() => {
      log.info(`Listening on http://${host}:${port}`)
    })
    .catch(err => {
      log.error(err)
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
          // eslint-disable-next-line no-console
          console.error('Failed to get index contents', err)
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

    app.use(...dirs.map(d => Sirv(d, { dev: true })))

    resolveStarted()
  }

  const ready = () => Promise.all([readyPromise, startedPromise])

  const close = () => app.close()

  return { start, ready, close }
}
