/* eslint-env node */

const path = require('path')
const child_process = require('child_process')

const EXAMPLE_DIR = path.resolve(__dirname, '../../example')
const CONFIG_FILE = path.resolve(EXAMPLE_DIR, 'rollup.config.svench.js')

const DEV_SERVER = path.resolve(EXAMPLE_DIR, 'scripts/nollup-dev-server')
const DEV_SERVER_MODULE = require.resolve(DEV_SERVER)

const nolluprc = {
  hot: true,
  config: `rollup.config.svench.js`,
  watch: ['src', '.svench', 'node_modules/svench', '../src', '../themes'],
}

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export const fork = ({ port, dir, nollupPort }) => {
  let closing = false
  let closed = false

  const readyPromise = deferred()
  const closePromise = deferred()

  const rc = { ...nolluprc, port: nollupPort }

  const child = child_process.fork(DEV_SERVER_MODULE, {
    cwd: EXAMPLE_DIR,
    env: {
      // SVENCH: 1,
      SVENCH_PORT: port,
      SVENCH_DIR: dir,
    },
  })

  child.send({ type: 'start', rc, config: CONFIG_FILE })

  const handleExit = code => {
    closed = true
    if (closing) {
      if (code == 0) {
        closePromise.resolve()
      } else {
        handleError(new Error(`Close with exit code ${code}`))
      }
    } else {
      handleError(new Error(`Closed unexpectedly with exit code: ${code}`))
    }
  }

  const handleError = err => {
    readyPromise.reject(err)
    closePromise.reject(err)
    closed = true
  }

  child.on('exit', handleExit)
  child.on('error', handleError)

  child.on('message', msg => {
    if (msg.type === 'bundle') {
      readyPromise.resolve()
    } else {
      throw new Error('Unknown message: ' + JSON.stringify(msg))
    }
  })

  const close = () => {
    if (!closed) {
      closing = true
      child.send({ type: 'close' })
    }
    return readyPromise.promise.then(() => closePromise.promise)
  }

  return { close, onReady: () => readyPromise.promise }
}
