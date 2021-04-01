import * as path from 'path'
import * as fs from 'fs'
import { fork } from './test-server-nollup.js'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

const apps = Object.fromEntries(
  fs.readdirSync(FIXTURES_DIR).map(name => {
    const dir = path.resolve(FIXTURES_DIR, name)
    const env = require(path.join(dir, 'env.json'))
    return [
      name,
      {
        nollupPort: env.port + '1',
        ...env,
        dir,
        name,
        refs: 0,
      },
    ]
  })
)

apps.example = { name: 'example', port: 4242, nollupPort: 42421, refs: 0 }

const getApp = name => {
  const app = apps[name]
  if (!app) {
    throw new Error(`Unknown app: ${name}`)
  }
  return app
}

const close = async name => {
  const app = getApp(name)
  app.refs--
  if (app.refs === 0) {
    const { close } = app.process
    delete app.process
    await close()
  }
}

export const start = async name => {
  const app = getApp(name)
  if (app.refs === 0) {
    app.process = fork(app)
    await app.process.onReady()
  }
  app.refs++
  return () => close(name)
}

export const startFixture = (fixture, name) =>
  fixture(name)
    .before(async ctx => {
      ctx.close = await start(name)
    })
    .after(ctx => ctx.close())

if (process.argv.includes('--all')) {
  Promise.all(Object.keys(apps).map(start)).then(closers => {
    return new Promise((resolve, reject) => {
      process.on('SIGTERM', () => {
        Promise.all(closers.map(fn => fn()))
          .then(resolve)
          .catch(reject)
          .finally(() => {
            process.exit(0)
          })
      })
    })
  })
} else if (process.argv[1].includes('test/util/start') && process.argv[2]) {
  start(process.argv[2]).catch(err => {
    // eslint-disable-next-line no-console
    console.error(err)
  })
}
