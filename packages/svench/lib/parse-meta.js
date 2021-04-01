import * as fs from 'fs'

import { SVENCH_META_START, SVENCH_META_END } from './const.js'
import { escapeRe } from './util.js'

const extractMetaRe = new RegExp(
  `${escapeRe(SVENCH_META_START)}([\\s\\S]+?)${escapeRe(SVENCH_META_END)}`
)

const extractSvenchMeta = (code, filename) => {
  const match = extractMetaRe.exec(code)
  if (!match) {
    throw new Error(`Failed to find meta (${filename})`)
  }
  return JSON.parse(match[1])
}

export const parseMeta = async (preprocess, filename) => {
  let code = await fs.promises.readFile(filename, 'utf8')

  ;({ code } = await preprocess(code, { filename }))

  const { views, options, headings } = extractSvenchMeta(code, filename)

  return {
    options: options || {},
    views: !options || !options.dynamic ? views : null,
    headings,
  }
}
