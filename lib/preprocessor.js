const path = require('path')
const { parse, walk } = require('svelte/compiler')
const dedent = require('dedent')
const { stringHashCode } = require('./hash.js')

const cleanExtensions = exts =>
  exts.map(ext => ext.trim()).map(ext => (ext[0] === '.' ? ext : '.' + ext))

const parseExtensions = x =>
  Array.isArray(x) ? cleanExtensions(x) : cleanExtensions(x.split(','))

const defaultExtensions = ['.svench', '.svench.svx', '.svench.svexy']

const extensionMatcher = _extensions => {
  const extensions = parseExtensions(_extensions)
  return x => extensions.some(ext => x.slice(-ext.length) === ext)
}

const first = array => array[0]

const last = array => array[array.length - 1]

const hasNamed = name => x => x.name === name

// TODO dynamic values :-/
const getAttributeValue = attr =>
  attr.value
    .filter(({ type }) => type === 'Text')
    .map(({ data }) => data)
    .join(' ')

const { stringify } = JSON

const Chars = source => {
  const splices = []
  const appends = []

  const splice = (...args) => {
    splices.push(args)
    return me
  }

  const append = string => {
    appends.push(string)
    return me
  }

  const toString = () => {
    const chars = Array.from(source)
    splices.sort((a, b) => b[0] - a[0])
    splices.forEach(args => chars.splice(...args))
    return chars.join('') + appends.join('')
  }

  const me = { splice, append, toString }

  return me
}

module.exports = ({
  extensions = defaultExtensions,
  defaultViewName = index => `View ${index + 1}`,
} = {}) => {
  const matchExtensions = extensionMatcher(extensions)

  const markup = ({ content, filename }) => {
    if (!matchExtensions(filename)) return null

    const basename = path.basename(filename)

    if (basename[0] === '_') return null

    const ast = parse(content, { filename })
    const chars = Chars(content)
    const names = []
    // const viewIndex = 0

    // find View import
    let viewName
    walk(ast.instance, {
      enter(node) {
        if (viewName) return this.skip()
        switch (node.type) {
          case 'ImportDeclaration':
            const source = node.source.value || node.source.raw
            if (source !== 'svench') break
            const specifier = node.specifiers.find(
              node => node.imported.name === 'View'
            )
            if (!specifier) break
            viewName = specifier.local.name
            break
        }
      },
    })

    if (!viewName) {
      viewName = 'svench:view'
      return null
    }

    walk(ast.html, {
      enter(node, parent, prop, index) {
        switch (node.type) {
          case 'InlineComponent': {
            const { name, children, attributes } = node
            if (name === viewName) {
              // const index = viewIndex++
              const extraAttributes = []

              // // <svench:view => <SvenchView
              // chars.splice(node.start, name.length + 1, '<SvenchView ')
              // // </svench:view> => </SvenchView>
              // chars.splice(last(children).end + 2, name.length, 'SvenchView ')

              // name
              const nameAttr = attributes.find(hasNamed('name'))
              const actualName = nameAttr
                ? getAttributeValue(nameAttr)
                : defaultViewName(names.length)
              names.push(actualName)
              if (!nameAttr) {
                extraAttributes.push(`name={${stringify(actualName)}}`)
              }

              // source
              const hasOwnSource = attributes.some(hasNamed('source'))
              if (!hasOwnSource) {
                const source =
                  children && children.length > 0
                    ? dedent(
                        content.slice(first(children).start, last(children).end)
                      )
                    : ''
                extraAttributes.push(`source={${stringify(source)}}`)
              }

              // extra attributes
              if (extraAttributes.length > 0) {
                chars.splice(
                  first(children).start - 1,
                  0,
                  ' ' + extraAttributes.join(' ')
                )
              }
            }
          }
        }
      },
    })

    const hash = stringHashCode(filename)

    // // <script context="module">
    // const NL = '\n'
    // const makeSafeName = name => name.replace(/\s/g, '_')
    // const module = dedent`
    //   <script context="module">
    //     import { View as SvenchView } from 'svench'
    //     import __Self from './${basename}'
    //     ${names
    //       .map(makeSafeName)
    //       .map(
    //         name => `
    //     export function ${name} ({ props, ...cfg }, ...rest) {
    //       return new __Self({
    //         ...args,
    //         props: {
    //           ...props,
    //         },
    //       }, ...rest)
    //     }
    //     `
    //       )
    //       .join(NL)}
    //   </script>
    // `
    // chars.append(NL + module)

    const idCode = `export const __svench_id = ${JSON.stringify(hash)}`

    if (ast.module) {
      chars.splice(ast.module.end - '<script/>'.length, 0, ';' + idCode)
    } else {
      chars.append(dedent`
        \n<script context="module">
          ${idCode}
        </script>
      `)
    }

    const code = chars.toString()

    return { code }
  }

  return { markup }
}
