import { readable } from 'svelte/store'
import Register from './Register.svelte'

export default ({ routes, router, makeNamer }) => route => {
  route.views$ = readable([], set => {
    let cmp

    route
      .import()
      .then(({ default: component }) => {
        let views = []

        const register = name => {
          views.push(name)
          set(views)
          setTimeout(() => {
            views = []
          })
        }

        cmp = new Register({
          target: document.createDocumentFragment(),
          props: {
            router,
            routes,
            route,
            component,
            register,
            makeNamer,
          },
        })
      })
      .catch(err => {
        // DEBUG DEBUG DEBUG handle error properly
        console.error('register error', err)
      })

    return () => {
      if (cmp) cmp.$destroy()
    }
  })
}
