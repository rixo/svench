<script>
  import { View } from 'svench'
</script>

<svench:options title="Getting started" tree />

# Svench

_A workbench for your Svelte components, in the form of a companion web app, to experiment, develop, and document._

This is Svench's docs site. This site is itself a living Svench!

## What is Svench?

Svench lets you write docs like this page (powered by [mdsvex](https://mdsvex.com/)) and, also, work with your components in views like this one:

_(click the title to "enter the view")_

<View
  name="example of a view"
  knobs={{ padding: '-100-100;1', center: true }}
  let:knobs={{ padding, center }}
  let:action
>
  <div style="padding: {padding}px; text-align: {center ? 'center' : 'inherit'};">
    <p>This is just a <code>&lt;p&gt;</code></p>

    <p>Padding: <code>{padding}</code>
    <br>
    <em>(use knobs to change)</em>
    </p>

    <p>... but in real life, why not put your components in here?</p>

    <p>
      <button on:click={action('click')}>Click! Click</button>
    </p>
  </div>
</View>

## What for?

Svench standalone mode lets you jolt some code to test and tinker with a Svelte / HTML / CSS / JS idea without further ado. It can also be useful to quickly preview some Markdown as you write it, or render a bunch of Markdown that's sitting on your drive for pleasant reading.

You can also include Svench in your project, to develop your components in isolation, build a catalog of your app's components in all their state, and throw in some notes or documentation beside them.

Generally speaking, Svench is developed with a very strong focus on simplicity and speed (feedback loop). It's goal is to "just work", and do it fast!

## Features

- Develop Svelte components in isolation with idiomatic Svelte syntax.

- Automatic menu from file layout.

- Document along and live preview your Markdown docs (via [mdsvex](https://mdsvex.com/)).

- -- _Experimental_ -- Integrates with your Vite or Rollup project's existing config, to use same build plugins, aliases, etc., without the need for a double config maintenance.

- Best in class HMR support.

## Work in progress

Essential features are now basically in place, but only a limited range of setups have really been tested for compatibility. We're now eager for feedback from the terrain to ensure & fix compatibility with the widest range of possible setups.

**Currently, Vite support is the main focus.** Svench was initially developed for Rollup / Nollup, and Rollup support is still here, but it is not maintained as closely currently.

Documentation is in the works.

Compatibility with Kit projects is the next big target.

## Try it

Wanna give it a try?

### Standalone

If you ever need to preview a bunch of Markdown or something... Install globally, and run from anywhere.

Install:

```bash
npm install --global svench-cli
# or
pnpm add --global svench-cli
# or
yarn add --global svench-cli
```

Run:

```bash
svench
```

Add some contents somehow:

```bash
echo "# Hello" > hello.md
echo "<h1>Hey!</h1>" > hey.svench
```

In this mode, Svench uses Vite and writes its files to your OS temp dir.

**NOTE** Svench decides automatically whether it should run in standalone mode by trying to resolve (using Node resolution algorithm) the presence of the `svench` package from the current directory. If it doesn't find it, then it runs in standalone mode. You can always force running in standalone mode with `svench --tmp`.

### In your project

For more formal use as a part of your project docs...

Install:

```bash
npm install --dev svench
# or
pnpm add --dev svench
# or
yarn add --dev svench
```

Run:

```bash
npx svench
```

Open your browser at http://localhost:4242.

Maybe add some `.svench` files?

`src/Hello.svench`

```svelte
<script>
  import { View } from 'svench'
</script>

<View name="hello">
  <h1>World!</h1>
</View>
```

Or some Markdown (mdsvex):

`src/Hello.md`

```markdown
# Docs

Most often easier to write as you go, when everything is _fresh_ in your head!
```
