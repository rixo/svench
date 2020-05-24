import * as fs from 'fs'
import * as path from 'path'
import Sirv from 'sirv'
import polka from 'polka'
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

export default (options, { getIndex }) => {
  options = parseOptions(options)

  const {
    public: dir,
    host,
    port,
    index: customIndex,
    encoding = 'utf8',
  } = options

  const dirs = !dir ? [] : Array.isArray(dir) ? dir : [dir]

  const findIndex = () => {
    for (const dir of dirs) {
      const filename = path.resolve(dir, customIndex)
      if (fs.existsSync(filename)) {
        return filename
      }
    }
  }

  const _getIndex = customIndex
    ? () => fs.promises.readFile(findIndex(), encoding)
    : getIndex

  const serveIndex = (req, res) => {
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

  const onNoMatch = serveIndex

  log.info(`Serving from ${dirs.join(', ')}`)

  const { handler: statics } = polka().use(
    ...dirs.map(d => Sirv(d, { dev: true, onNoMatch }))
  )

  const app = polka()
    .get('/', serveIndex)
    .get('/index.html', serveIndex)
    .get('/index', serveIndex)
    .get('*', statics)

  const readyPromise = new Promise((resolve, reject) => {
    app.listen({ host, port }, err => {
      if (err) {
        log.error(err)
        reject(err)
      } else {
        log.info(`Listening on http://${host}:${port}`)
        resolve()
      }
    })
  })

  const ready = () => readyPromise

  const close = () => app.server.close()

  return { ready, close }
}
