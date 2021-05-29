# Usage

`Foo.svench`

~~~svelte
<script>
  import { View } from 'svench'
</script>

<View name="defaults" let:action knobs={{prop1: false}} let:knobs={{prop1}}>
  <Foo on:click={action('click')} {prop1} />
</View>
~~~

`Foo.md`

~~~md
<script>
  import { Render } from 'svench'
</script>

# My Wonderful docs

Lorem ipsum dolor sit amet.

<Render src="" />
~~~
