# Svench

Svench is versatile tool to develop your Svelte components in isolation, and document them.

Please refer to the [docs site](https://svench.dev), and the monorepo's [README](https://github.com/rixo/svench#readme) for more information.

## Quick start

```bash
npm init -y
npm add -D svelte vite rollup-plugin-svelte-hot@next svench@beta
mkdir src
npx svench
echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
```

Open your browser at http://localhost:4242.
