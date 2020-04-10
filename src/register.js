import { readable, writable } from 'svelte/store'
import { pipe } from './util'
import Register from './RegisterRoute.svelte'
import { route } from '@sveltech/routify'

const filter = predicate => x => x.filter(predicate)

const forEach = mapper => x => x.forEach(mapper)

const notFallback = ({ isFallback }) => !isFallback

const addViewsStore = ({ viewRegisters, options, routes }) => route => {
  const { path } = route
  const error = writable(null)

  let _views = []
  let setViews

  const views$ = readable(_views, set => {
    // return () => {}
    // setViews = set

    const target = document.createElement('div')

    const cmp = new Register({
      target,
      props: {
        options,
        route,
        routes,
        callback(err, views) {
          if (err) error.set(err)
          _views = views
          set(views)
        },
      },
    })

    return () => cmp.$destroy()
  })

  route.svench.views$ = views$

  if (views$) {
    let __views = []
    let timeout

    viewRegisters[path] = name => {
      __views.push(name)
      _views = __views
      if (setViews) {
        setViews(_views)
      }
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        __views = []
      }, 50)
    }

    viewRegisters[path].path = path
  }
}

export const registerRoutes = (routes, options) => {
  const viewRegisters = {}

  let _route
  const destroyers = []

  // const destroy = route.subscribe(r => (_route = r))
  destroyers.push(
    route.subscribe(r => {
      _route = r
    })
  )

  destroyers.push(
    routes.subscribe(pipe(
      filter(notFallback),
      forEach(addViewsStore({ viewRegisters, options, routes }))
    ))
  )

  const register = (name, path = _route.path) => {
    // FIXME this is probably masking a bug in Routify
    // repro: be on a focused view page => navigate to fallback (i.e. dir)
    if (!viewRegisters[path]) {
      if (path === '/_fallback') return
      debugger // if someone ends up here, please report
      return
    }
    return viewRegisters[path](name)
  }

  const destroy = pipe(...destroyers)

  return { register, destroy }
}
