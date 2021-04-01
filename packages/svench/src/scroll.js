/**
 * Restore scroll and scroll to hash
 *
 * - on page load...
 *   - if stored session => restore stored scroll
 *   - if hash => track anchor
 *   - else => nothing (browser's default)
 *
 * - on navigate...
 *   - if pop state (meaning history nav) => restore last scroll
 *   - if hash (direct nav in new tab session) => track anchor
 *   - else (push state) => scroll top
 */
import { pipe } from './util.js'

// history.scrollRestoration = 'manual'

export default (getOptions, hasBeenIdle) => {
  const {
    // max tracking time
    max = 3100,
    // time no change before stable (and stop tracking)
    stableThreshold = 500,
    // time after idle when another scroll will cancel tracking (stop tracking
    // on user interaction)
    cancelableAfter = 100,
  } = {}

  let el

  let trackStart = null
  let canceled = false

  const getCurrent = () => el && { top: el.scrollTop, left: el.scrollLeft }

  const isStickBottom = restore =>
    getOptions().hmrScrollStickBottom &&
    Math.abs(el.scrollHeight - el.clientHeight - restore.top) < 1

  const getCurrentWithSticky = () => {
    const scroll = getCurrent()
    if (!scroll) return
    scroll.stickBottom = isStickBottom(scroll)
    return scroll
  }

  const registerCancelOnUserScroll = () => {
    const handleScroll = () => {
      if (hasBeenIdle(cancelableAfter)) {
        canceled = true
      }
    }

    el.addEventListener('scroll', handleScroll)

    return () => el.removeEventListener('scroll', handleScroll)
  }

  const registerTrackScrollState = () => {
    let scrollTimeout

    const saveScroll = () => {
      const scroll = getCurrent()
      history._replaceState({ ...history.state, scroll }, '')
    }

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(saveScroll, 50)
    }

    el.addEventListener('scroll', handleScroll)

    return () => el.removeEventListener('scroll', handleScroll)
  }

  const registerHmr = () => {
    let restore = null

    const before = () => {
      if (!el) return
      restore = getCurrentWithSticky()
    }

    const after = () => {
      if (!el) return
      trackScroll(restore)
    }

    if (typeof window !== 'undefined' && window.__SVELTE_HMR) {
      window.__SVELTE_HMR.on('beforeupdate', before)
      window.__SVELTE_HMR.on('afterupdate', after)
    } else if (import.meta.hot && import.meta.hot.beforeUpdate) {
      import.meta.hot.beforeUpdate(before)
      import.meta.hot.afterUpdate(after)
    }

    return () => {}
  }

  const registerSessionUnload = () => {
    const onUnload = e => {
      e.preventDefault()
      const { localStorageKey } = getOptions()
      if (!localStorageKey || !window.sessionStorage) return
      const key = `${localStorageKey}.scroll`
      const scroll = getCurrent()
      if (scroll) {
        sessionStorage.setItem(key, JSON.stringify(scroll))
      } else {
        sessionStorage.removeItem(key)
      }
    }

    window.addEventListener('unload', onUnload)

    return () => {
      removeEventListener('unload', onUnload)
    }
  }

  const restoreSession = () => {
    const { localStorageKey } = getOptions()
    if (!localStorageKey || !window.sessionStorage) return
    const key = `${localStorageKey}.scroll`
    const restore = sessionStorage.getItem(key)
    sessionStorage.setItem(key, null)
    if (restore) {
      trackScroll(JSON.parse(restore))
    }
  }

  const VOID = Symbol('Svench.scroll.VOID')

  const trackScroll = getScroll => {
    if (!getScroll) return

    const start = Date.now()
    let since = null
    let lastValue = VOID

    canceled = false
    trackStart = start

    const isIdle = () => hasBeenIdle(50)

    const track = () => {
      if (canceled) return
      const { top: _top, left, stickBottom = false, value = el.scrollHeight } =
        (typeof getScroll === 'function' ? getScroll() : getScroll) || {}
      const top = stickBottom ? el.scrollHeight : _top
      if (top != null) {
        el.scrollTo({ top, left })
      }
      if (isIdle() && value === lastValue) {
        if (Date.now() - since > stableThreshold) {
          trackStart = null
          return
        }
      } else {
        lastValue = value
        since = Date.now()
      }
      if (isIdle() && Date.now() - hasBeenIdle() - start > max) {
        // give up
        trackStart = null
        return
      }
      requestAnimationFrame(track)
    }

    track()
  }

  const trackAnchor = hash => {
    const name = hash.replace(/^#/, '')
    const offset = 0
    trackScroll(() => {
      const target = document.querySelector(
        `:target, ${hash}, a[name="${name}"]`
      )
      if (!target) return
      // TODO measure extraoffset from env
      const extraOffset = 12
      const top = target.offsetTop - offset - extraOffset
      return { top }
    })
  }

  const navigate = ({ hash, popState }) => () => {
    if (!el) return
    if (popState) {
      trackScroll(popState.scroll)
    } else if (hash) {
      // priority to session restore
      if (trackStart !== null) return
      trackAnchor(hash)
    } else {
      el.scrollTo({ top: 0 })
    }
  }

  let unregisterTargeted
  let initial = true

  const setTarget = target => {
    el = target

    if (initial) {
      initial = false
      restoreSession()
    } else {
      unregisterTargeted()
    }

    unregisterTargeted = pipe(
      () => {
        unregisterTargeted = null
      },
      registerCancelOnUserScroll(),
      registerTrackScrollState()
    )
  }

  const unregisterMain = pipe(registerHmr(), registerSessionUnload())

  const dispose = () => {
    unregisterMain()
    if (unregisterTargeted) unregisterTargeted()
  }

  return { dispose, navigate, setTarget }
}
