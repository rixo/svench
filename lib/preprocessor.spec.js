import { test, describe } from 'zorax'
import { preprocess } from 'svelte/compiler'
import dedent from 'dedent'

import Svench from './index.js'

// describe.skip('PENDING')

const defaultSource = `
    <script>
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <svench:view>
      <Cmp foo="42" />
    </svench:view>
`

const defaultFilename = '/projects/foo/src/test.svench'

const macro = async (
  t,
  { filename = defaultFilename, source = defaultSource, expected = source } = {}
) => {
  const { code } = await preprocess(dedent(source), [Svench()], { filename })
  t.eq(code, dedent(expected))
}

test('does not transform non matching extensions', macro, {
  filename: '/foo/test.svelte',
})

test('does not transform _layout.svench', macro, {
  filename: '/foo/layout.svelte',
})

// test('transforms', macro, {
//   source: `
//     <script>
//       import Cmp from './Cmp.svelte'
//     </script>
//
//     <svench:options opt="foo" bool={true} />
//
//     <svench:view name="foov">
//       <Cmp foo="42" />
//     </svench:view>
//   `,
//   expected: `
//     <script>
//       import Cmp from './Cmp.svelte'
//     </script>
//
//     <svench:options opt="foo" bool={true} />
//
//     <SvenchView  name="foov" source={"<Cmp foo=\\"42\\" />"}>
//       <Cmp foo="42" />
//     </SvenchView >
//   `,
// })
//
// test('transforms multiple views', macro, {
//   source: `
//     <script>
//       import Cmp from './Cmp.svelte'
//     </script>
//
//     <svench:options opt="foo" bool={true} />
//
//     <svench:view>
//       <Cmp foo="42" />
//     </svench:view>
//
//     <svench:view>
//       <Cmp foo={43} />
//     </svench:view>
//   `,
//   expected: `
//     <script>
//       import Cmp from './Cmp.svelte'
//     </script>
//
//     <svench:options opt="foo" bool={true} />
//
//     <SvenchView  name={"View 1"} source={"<Cmp foo=\\"42\\" />"}>
//       <Cmp foo="42" />
//     </SvenchView >
//
//     <SvenchView  name={"View 2"} source={"<Cmp foo={43} />"}>
//       <Cmp foo={43} />
//     </SvenchView >
//   `,
// })

test('does not replace provided source', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <View source="bla bla bla">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <svench:options opt="foo" bool={true} />

    <View source="bla bla bla" name={"View 1"}>
      <Cmp foo="42" />
    </View>
  `,
})

test('with import', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" source={${JSON.stringify('<Cmp foo="42" />')}}>
      <Cmp foo="42" />
    </View>
  `,
})

test.skip('multiple source nodes', macro, {
  source: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
      <Cmp foo="43" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever" source={${JSON.stringify('<Cmp foo="42" />\n<Cmp foo="43" />')}}>
      <Cmp foo="42" />
      <Cmp foo="43" />
    </View>
  `,
})

test('with aliased import', macro, {
  source: `
    <script>
      import { View as Story } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <Story name="whatever">
      <Cmp foo="42" />
    </Story>
  `,
  expected: `
    <script>
      import { View as Story } from 'svench'
      import Cmp from './Cmp.svelte'
    </script>

    <Story name="whatever" source={${JSON.stringify('<Cmp foo="42" />')}}>
      <Cmp foo="42" />
    </Story>
  `,
})

test('does not read source from other View component', macro, {
  source: `
    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
  expected: `
    <script>
      import { View } from 'foo'
      import Cmp from './Cmp.svelte'
    </script>

    <View name="whatever">
      <Cmp foo="42" />
    </View>
  `,
})
