import { updateContext } from '../util.js'

export default callback => {
  // console.trace()
  updateContext(ctx => ({
    ...ctx,
    onRender: callback,
  }))
}
