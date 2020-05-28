// import addClasses from 'rehype-add-classes'
// import squeezeParagraphs from 'remark-squeeze-paragraphs'
import { mdsvex } from 'mdsvex'

const { preprocess } = require('svelte/compiler')

import addClasses from './rehype-add-classes'
import preprocessSvench from './preprocessor'

const noPreprocess = code => ({ code })

noPreprocess.getCached = noPreprocess

export default ({ extensions, preprocessors = [], mdsvex: mdsvexEnabled }) => {
  const cache = {}

  const extension = '.svx'
  const svenchPreprocessors = [
    mdsvexEnabled &&
      mdsvex({
        extension,
        smartypants: false,
        rehypePlugins: [
          [addClasses, { '*': 'svench-content svench-content-md' }],
        ],
      }),

    ...preprocessors,

    preprocessSvench({ extensions }),

    // trim first <p></p> that happens with mdsvex because of:
    //     <p><svench:options ... /></p>
    mdsvexEnabled && {
      markup({ content, filename }) {
        if (!filename.endsWith(extension)) return
        let code = content
        if (filename.includes('example_docs')) {
          code = code.replace(/<p[^>]*><\/p>/, ' '.repeat('<p></p>'.length))
        }
        return { code }
      },
    },
  ].filter(Boolean)

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
