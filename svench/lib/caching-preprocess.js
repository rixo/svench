// import addClasses from 'rehype-add-classes'
// import squeezeParagraphs from 'remark-squeeze-paragraphs'
import { mdsvex } from 'mdsvex'
import link from 'rehype-autolink-headings'
import slug from 'rehype-slug'
// import gemoji from
// import gemojiToEmoji from 'remark-gemoji-to-emoji'

import { preprocess } from 'svelte/compiler'
import addClasses from './rehype-add-classes.js'
import preprocessSvench from './preprocessor.js'
import { stringHashcode } from './util.js'

const noPreprocess = code => ({ code })

noPreprocess.getCached = noPreprocess

const maybeCustomExtension = (dft, x) => (typeof x === 'string' ? x : dft)

export default ({
  extensions,
  preprocessors = [],
  mdsvex: mdsvexEnabled,
  md: mdEnabled,

  disableCache = false, // TODO wire externally
}) => {
  const cache = {}

  const mdsvexExtension = maybeCustomExtension('.svx', mdsvexEnabled)
  const mdExtension = maybeCustomExtension('.md', mdEnabled)

  const usedExtensions = [mdsvexExtension, mdExtension].filter(Boolean)

  const matchExtensions = x => usedExtensions.some(ext => x.endsWith(ext))

  const rehypePlugins = [
    slug,
    [link, { behavior: 'append', properties: { className: 'svench-anchor' } }],
    [addClasses, { '*': 'svench-content svench-content-md' }],
  ]

  const svenchPreprocessors = [
    mdsvexEnabled &&
      mdsvex({
        extension: mdsvexExtension,
        smartypants: false,
        // remarkPlugins: [gemojiToEmoji],
        rehypePlugins,
      }),

    mdEnabled &&
      mdsvex({
        extension: mdExtension,
        smartypants: false,
        rehypePlugins,
      }),

    ...preprocessors,

    preprocessSvench({ extensions }),

    // trim first <p></p> that happens with mdsvex because of:
    //     <p><svench:options ... /></p>
    mdsvexEnabled && {
      markup({ content, filename }) {
        if (!matchExtensions(filename)) return
        let code = content
        code = code.replace(/<p[^>]*><\/p>/, ' '.repeat('<p></p>'.length))
        return { code }
      },
    },
  ].filter(Boolean)

  const push = async (
    code,
    { filename, length = code.length, hash, ...attributes }
  ) => {
    const result = preprocess(code, svenchPreprocessors, {
      filename,
      ...attributes,
    })
    if (!disableCache) {
      cache[filename] = {
        length,
        hash: hash || stringHashcode(code),
        result,
      }
    }
    return result
  }

  const pull = async ({ content, filename }) => {
    const length = content.length
    const hash = stringHashcode(content)
    const cached = cache[filename]
    delete cache[filename]
    if (cached && cached.length === length && cached.hash === hash) {
      return cached.result
    }
    return await push(content, { filename, length, hash })
  }

  return { push, pull }
}
