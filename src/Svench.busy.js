/**
 * Track busy / idle state of application.
 *
 * Application is considered busy when loading / rendering the main content.
 *
 * When not busy, application will prefetech.
 */

import { beforeUpdate, afterUpdate } from 'svelte'
import { Deferred } from './util.js'

export default () => {
  let active = 0
  // NOTE start idle because we want to wait initial page render
  let idle = false
  let idleSince

  let timeout

  let idlePromise = Deferred()

  const setIdle = _idle => {
    if (idle === _idle) return
    idle = _idle
    if (idle) {
      idleSince = Date.now()
      idlePromise.resolve()
    } else {
      idlePromise = Deferred()
    }
  }

  const enter = () => {
    if (active === 0) setIdle(false)
    active++
    let done = false
    return () => {
      if (done) return
      done = true
      active--
      if (active === 0) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          if (active === 0) setIdle(true)
        }, 100)
      }
    }
  }

  const hasBeenIdle = duration => idle && Date.now() - idleSince > duration

  const trackUpdate = () => {
    let ready
    beforeUpdate(() => {
      ready = enter()
    })
    afterUpdate(() => {
      ready()
    })
  }

  return {
    enter,
    idle: () => idlePromise.promise,
    hasBeenIdle,
    trackUpdate,
  }
}
