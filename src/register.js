import { derived, readable, writable } from 'svelte/store'
import { pipe, noop } from './util'
import Register from './RegisterRoute.svelte'
import { route } from '@sveltech/routify'

const filter = predicate => x => x.filter(predicate)

const map = mapper => x => x.map(mapper)

const isPage = ({ isFallback }) => !isFallback

// const trimPages = _routes => {
//   const trimmed = {}
//   for (const route of _routes) {
//     const { path } = route
//     trimmed[path] = []
//   }
//   return trimmed
// }

const mapRoute = ({ viewRegisters, options, routes }) => route => {
  const { path, shortPath, isIndex, component, meta } = route
  const error = writable(null)

  // const views = isIndex ? null : writable([])

  let _views = []
  let setViews

  const views = isIndex
    ? null
    : readable(_views, set => {
        // setViews = set

        const target = document.createElement('div')

        const cmp = new Register({
          target,
          props: {
            options,
            route,
            routes,
            loader: component,
            // register: name => register(name, path),
            callback(err, views) {
              if (err) error.set(err)
              _views = views
              set(views)
            },
          },
        })

        return () => cmp.$destroy()
      })

  const page = {
    id: path,
    isIndex,
    path,
    shortPath,

    loader: component,

    views,

    // views: isIndex
    //   ? null
    //   : readable([], set => {
    //       const target = document.createElement('div')
    //
    //       const cmp = new Register({
    //         target,
    //         props: {
    //           loader: component,
    //           callback(err, views) {
    //             if (err) error.set(err)
    //             set(views)
    //           },
    //         },
    //       })
    //
    //       return () => cmp.$destroy()
    //     }),
  }

  // title
  if (meta && meta['svench:title'] != null) {
    page.title = meta['svench:title'].replace(/_/g, ' ')
  }

  if (views) {
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

  // registers[path] = name => {
  //   _views.push(name || $options.defaultViewName(_views.length + 1))
  //
  //   views.set(_views)
  //
  //   schedule(() => {
  //     _views = []
  //   })
  // }

  return page
}

const pipedDerived = (...fns) => source => derived(source, pipe(...fns))

// returns $pages
// export const registerRoutes = routes =>
//   derived(routes, pipe(filter(isPage), map(mapRoute)))

// export const registerRoutes = pipedDerived(filter(isPage), map(mapRoute))

// export const registerRoutes = pipedDerived(filter(isPage), map(mapRoute))

export const registerRoutes = (routes, options) => {
  const viewRegisters = {}

  let _route

  const destroy = route.subscribe(r => (_route = r))

  const register = (name, path = _route.path) => viewRegisters[path](name)

  const pages = pipedDerived(
    filter(isPage),
    map(mapRoute({ viewRegisters, options, routes }))
  )(routes)

  return { register, pages, destroy }
}
