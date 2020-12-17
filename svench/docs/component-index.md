```html
<script>
  import { View, Index } from 'svench'
  import { Docs } from 'svench/page'
  import { Nude } from 'svench/view'
</script>

<Index ui="{Docs}">
  <Render name="foo, bar" ui="{Table}" />
  <Render name={['foo', 'bar']} ui={Atoms} />
  <Render name="foo, ba*" ui="{[Atoms," { ...uiProps }]} />
  <Render name="@color" />
</Index>

<View name="foo">...</View>

<View name="bar">...</View>

<View name="baz" ui="{Nude}">...</View>

<View name="bat">...</View>

<View name="bat" tags="atom, color.light">...</View>
```

```html
<script>
  export let name
  export let source
  export let href

  export let error = null

  export let options
</script>

<slot />
```

```html
<script>
  import { ViewCanvas } from 'svench'

  export let name
  export let source
  export let href

  export let error = null

  export let options
</script>

<slot />
```

## Colors

```html
<script>
  const colors = [
    {
      value: 'red',
      category: 'semantic',
      name: 'Border',
      variable: '--color-semantic-border',
    },
    {
      value: 'blue',
      category: 'semantic',
      name: 'Blue',
      variable: '--color-semantic-border',
    },
  ]
</script>
```

## Flex list

```html
{#each views as [icon, label]}
<View name="{icon}">
  <button icon="close" label="Close" />
</View>
{/each}
```

```html
{#each views as [icon, label]}
<ViewBox>
  <View name="{icon}">
    <button icon="close" label="Close" />
  </View>
</ViewBox>
{/each}
```
