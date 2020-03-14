# Svench

> A lightweight workbench to develop your Svelte components in isolation.

**WORK IN PROGRESS**

## Running the example

~~~bash
git clone git@github.com:rixo/svench.git
cd svench/example
yarn
yarn svench
~~~

## Usage

Add `.svench` files to the `src` directory to add pages to your style book.

Those are normal Svelte files, `.svench` is just a special extension to identify pages of the book. It makes it possible to collocate the Svench files beside the component they illustrate (which I like to do) with reduced mess in your actual sources.

The example is also configured with [MDsveX](https://github.com/pngwn/MDsveX), so you can add `.svench.svx` files too!

Inside a `.svench` file, you define some "views" that each represent a possible state of your component.

~~~html
<script>
  import { View } from 'svench'

  import Foo from './Foo.svelte'

  // use the powers of Svelte to your advantage
  const defaults = { x: 1 }
</script>

<View name="default">
  <Foo {...defaults} />
</View>

<View name="other">
  <Foo {...defaults} other />
</View>
~~~
