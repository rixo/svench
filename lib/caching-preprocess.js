import preprocessSvench from './preprocessor'
const { preprocess } = require('svelte/compiler')

const noPreprocess = code => ({ code })

noPreprocess.getCached = noPreprocess

export default ({ extensions, preprocessors = [] }) => {
  const cache = {}

  const svenchPreprocessors = [
    ...preprocessors,
    preprocessSvench({ extensions }),
  ]

  const push = (...args) => {
    const [, { filename }] = args
    const result = preprocess(args.shift(), svenchPreprocessors, ...args)
    cache[filename] = result
    return result
  }

  const pull = async ({ content, filename }) => {
    const cached = cache[filename]
    if (cached) {
      delete cache[filename]
      return cached
    }
    return preprocess(content, preprocessors, { filename })
  }

  return { push, pull }
}
