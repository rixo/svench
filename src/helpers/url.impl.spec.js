import { test } from 'zorax'

import { resolveUrl } from './url.impl.js'

const throwsOutside = {
  throws: /\boutside of app\b/,
}

// expects: [ [input, expected] ]
export const specs = [
  // {
  //   // TODO keep?
  //   from: '',
  //   expects: [
  //     ['', ''],
  //     // relative
  //     ['.', '/'],
  //     ['./', '/'],
  //     ['..', throwsOutside],
  //     ['../', throwsOutside],
  //     ['./foo', '/foo'],
  //     ['../foo', throwsOutside],
  //     ['../foo', throwsOutside],
  //     ['./foo/', '/foo/'],
  //     ['../foo/', throwsOutside],
  //     // absolute
  //     ['/foo', '/foo'],
  //     ['/foo/', '/foo/'],
  //     ['/', '/'],
  //     ['/a/b/c', '/a/b/c'],
  //     ['/a/b/c/', '/a/b/c/'],
  //   ],
  // },
  {
    from: '/',
    expects: [
      ['', '/'],
      // relative
      ['.', '/'],
      ['./', '/'],
      ['..', throwsOutside],
      ['../', throwsOutside],
      ['./foo', '/foo'],
      ['../foo', throwsOutside],
      ['../../foo', throwsOutside],
      ['./foo/', '/foo/'],
      ['../foo/', throwsOutside],
      ['./../foo/', throwsOutside],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
  {
    from: '/index',
    expects: [
      ['', '/'],
      // relative
      ['.', '/'],
      ['./', '/'],
      ['..', throwsOutside],
      ['../', throwsOutside],
      ['./foo', '/foo'],
      ['../foo', throwsOutside],
      ['./foo/', '/foo/'],
      ['../foo/', throwsOutside],
      ['./../foo/', throwsOutside],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
  // {
  //   from: '/index/',
  //   expects: [
  //     ['', '/index/'],
  //     // relative
  //     ['.', '/index/'],
  //     ['./', '/index/'],
  //     ['..', '/'],
  //     ['../', '/'],
  //     ['./foo', '/index/foo'],
  //     ['../foo', '/foo'],
  //     ['./foo/', '/index/foo/'],
  //     ['../foo/', '/foo/'],
  //     ['./../foo/', '/foo/'],
  //     // absolute
  //     ['/foo', '/foo'],
  //     ['/foo/', '/foo/'],
  //     ['/', '/'],
  //     ['/a/b/c', '/a/b/c'],
  //     ['/a/b/c/', '/a/b/c/'],
  //   ],
  // },
  {
    from: '/a',
    expects: [
      ['', '/a'],
      // relative
      ['.', '/'],
      ['./', '/'],
      ['..', throwsOutside],
      ['../', throwsOutside],
      ['./foo', '/foo'],
      ['../foo', throwsOutside],
      ['./foo/', '/foo/'],
      ['../foo/', throwsOutside],
      ['./../foo/', throwsOutside],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
  {
    from: '/a/',
    expects: [
      ['', '/a/'],
      // relative
      ['.', '/a/'],
      ['./', '/a/'],
      ['..', '/'],
      ['../', '/'],
      ['./foo', '/a/foo'],
      ['../foo', '/foo'],
      ['./foo/', '/a/foo/'],
      ['../foo/', '/foo/'],
      ['./../foo/', '/foo/'],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
  {
    from: '/a/b/c',
    expects: [
      ['', '/a/b/c'],
      // relative
      ['.', '/a/b/'],
      ['./', '/a/b/'],
      ['..', '/a/'],
      ['../', '/a/'],
      ['./foo', '/a/b/foo'],
      ['../foo', '/a/foo'],
      ['./foo/', '/a/b/foo/'],
      ['../foo/', '/a/foo/'],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
  {
    from: '/a/b/c/',
    expects: [
      ['', '/a/b/c/'],
      // relative
      ['.', '/a/b/c/'],
      ['./', '/a/b/c/'],
      ['..', '/a/b/'],
      ['../', '/a/b/'],
      ['./foo', '/a/b/c/foo'],
      ['../foo', '/a/b/foo'],
      ['./foo/', '/a/b/c/foo/'],
      ['../foo/', '/a/b/foo/'],
      // absolute
      ['/foo', '/foo'],
      ['/foo/', '/foo/'],
      ['/', '/'],
      ['/a/b/c', '/a/b/c'],
      ['/a/b/c/', '/a/b/c/'],
    ],
  },
]

const macro = (t, from, input, expected) => {
  // throws
  if (expected.throws) {
    t.throws(
      () => {
        const actual = resolveUrl(from, input)
        return actual
      },
      expected.throws
      // `'${input}' throws '${expected.throws}'`
    )
  }
  // equal
  else {
    const actual = resolveUrl(from, input)
    t.eq(actual, expected)
  }
}

macro.title = (title, from, input, expected) =>
  title ||
  `${from}: ${input} => ${
    expected.throws ? `throws ${expected.throws}` : expected
  }`

for (const { from, expects } of specs) {
  for (const [input, expected] of expects) {
    test(macro, from, input, expected)
  }
}
