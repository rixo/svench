import * as fs from 'fs'
import * as path from 'path'
import Sirv from 'sirv'
import express from 'express'
// import polka from 'polka'
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

  const _getIndex = customIndex
    ? () => fs.promises.readFile(path.resolve(dir, customIndex), encoding)
    : getIndex

  const serveIndex = (req, res) => {
    Promise.resolve(_getIndex())
      .then(index => {
        res.send(index)
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Failed to get index contents', err)
        res.sendStatus(500)
      })
  }

  const onNoMatch = serveIndex

  const sirv = Sirv(dir, { dev: true, onNoMatch })

  log.info(`Serving from ${dir}`)

  const server = express()
    .get(['/', '/index.html', '/index'], serveIndex)
    .use(sirv)
    .get('*', serveIndex)
    .listen({ host, port }, err => {
      if (err) log.error(err)
      else log.info(`Listening on ${host}:${port}`)
    })

  const close = () => server.close()

  return { close }
}
