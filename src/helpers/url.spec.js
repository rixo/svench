import { test } from 'zorax'

import { urlResolver } from './url.js'

const throwsOutside = {
  throws: /\boutside of app\b/,
}

// expects: [ [input, expected] ]
export const specs = [
  // {
  //   route: {
  //     path: '/custom_index/index',
  //     extraNesting: 1,
  //     isIndex: false,
  //   },
  //   expects: [['./custom_index', '/custom_index']],
  // },
  // {
  //   route: {
  //     path: '/docs/index',
  //     extraNesting: 1,
  //     isIndex: false,
  //   },
  //   expects: [['/docs/index', '/custom_index']],
  // },
  {
    route: {
      path: '/Mdsvex/example_docs',
      extraNesting: 1,
      isIndex: false,
    },
    expects: [['declare_views', '/Mdsvex/declare_views']],
  },
]

const macro = (t, from, input, expected, route) => {
  const resolve = urlResolver(route)
  // throws
  if (expected.throws) {
    t.throws(
      () => {
        resolve(input)
      },
      expected.throws
      // `'${input}' throws '${expected.throws}'`
    )
  }
  // equal
  else {
    const actual = resolve(input)
    t.eq(actual, expected)
  }
}

macro.title = (title, from, input, expected) =>
  title ||
  `${from}: ${input} => ${
    expected.throws ? `throws ${expected.throws}` : expected
  }`

for (const { route, from = route.path, expects } of specs) {
  for (const [input, expected] of expects) {
    test(macro, from, input, expected, { ...route, path: from })
  }
}
