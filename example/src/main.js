import {Svench} from 'svench'

import { routes } from '@sveltech/routify/tmp/routes'

// // const app = document.createElement('svench-app')
// document.body.innerHTML = '<svench-app></svench-app>'
// const app = document.body.querySelector('svench-app')
//
// // document.body.appendChild(app)
//
// // console.log('set', routes)
// setTimeout(() => {
//   console.log(app)
//   app.$set({routes})
//   // app.routes = routes
// }
// , 500)
//
// // window.Svench = target => new Svench({ target, props: { routes } })
console.log(routes)

const app = new Svench({
  target: document.body,
  props: {
    routes,
  },
})

// recreate the whole app if an HMR update touches this module
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.$destroy()
  })
  import.meta.hot.accept()
}
