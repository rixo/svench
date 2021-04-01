# Svench

Svench is versatile tool to develop your Svelte components in isolation, and document them.

Please refer to the [docs site](https://svench.dev), or the monorepo's [README](https://github.com/rixo/svench#readme) for more information.

## Try it

## Standalone

```bash
npm install --global svench-cli

npx svench

echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
```

## In a project

```bash
# create a barebone project (or use your own -- backup first!)
npm init -y
mkdir src
npm add -D svelte vite @sveltejs/vite-plugin-svelte

# install
svench

# run
npx svench

echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
```

Open your browser at http://localhost:4242.
