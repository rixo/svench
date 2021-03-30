# Svench

> The multipurpose companion tool to your Svelte development.

This is Svench's docs site. This site itself is a living Svench!

## Features

- Develop Svelte components in isolation with idiomatic Svelte syntax.

- Automatic menu from file layout.

- Document along and live preview your Markdown docs (via [mdsvex](https://mdsvex.com/)).

- Integrates with your project's existing config, to use same build plugins, aliases, etc., without the need for a double config maintenance (as much as possible -- supports Vite and Rollup).

- Best in class HMR support.

## Work in progress

Essential features are now in place, but only basic setups have really been tested for compatibility. We're now eager for feedback from the terrain to ensure & fix compatibility with the widest range of possible setups.

**Currently, Vite support is the main focus.** Svench was initially developed for Rollup / Nollup, and Rollup support is still here, but it is not maintained as closely currently.

Documentation is in the works.

## Quick start

Wanna give Svench a try for yourself?

### In your project

```bash
npm install --dev svench
npx svench
```

Open your browser at http://localhost:4242.

Maybe add some `.svench` files:

`src/Hello.svench`

```svelte
<script>
  import { View } from 'svench'
</script>

<View name="hello">
  <h1>World!</h1>
</View>
```

### Standalone

If you ever need to preview a bunch of Markdown or something... Install globally, and run from anywhere:

```bash
npm install --global svench-cli
echo "# Hello" > hello.md
echo "<h1>Hey!</h1>" > hey.svench
svench
```
