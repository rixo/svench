import fs from 'fs'
import path from 'path'

const queryRE = /\?.*$/s
const hashRE = /#.*$/s

const cleanUrl = url => url.replace(hashRE, '').replace(queryRE, '')

// const getHtmlFilename = (url, server) => {
//   // if (url.startsWith(FS_PREFIX)) {
//   //   return fsPathFromId(url)
//   // } else {
//   return path.join(server.config.root, url.slice(1))
//   // }
// }

// from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/indexHtml.ts
export function indexHtmlMiddleware(server, { svenchDir, send }) {
  return async function svenchIndexHtmlMiddleware(req, res, next) {
    if (res.writableEnded) {
      return next()
    }

    const url = req.url && cleanUrl(req.url)

    // spa-fallback always redirects to /index.html
    if (url?.endsWith('.html') && req.headers['sec-fetch-dest'] !== 'script') {
      if (url !== '/index.html') {
        return next()
      }
      const filename = path.join(svenchDir, url.slice(1))
      // const filename = getHtmlFilename(url, server)
      if (fs.existsSync(filename)) {
        try {
          let html = fs.readFileSync(filename, 'utf-8')
          html = await server.transformIndexHtml(url, html, req.originalUrl)
          return send(req, res, html, 'html')
        } catch (e) {
          return next(e)
        }
      }
    }
    next()
  }
}
