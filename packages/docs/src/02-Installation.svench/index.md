<svench:options title="Installation and running" />

# Installation

## From scratch

### With npm

```
npm init -y
npm add -D svelte vite @sveltejs/vite-plugin-svelte svench
mkdir src
echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
npx svench
```

### With pnpm

```
pnpm init -y
pnpm add -D svelte vite @sveltejs/vite-plugin-svelte svench
mkdir src
echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
pnpx svench
```

### With yarn

```
yarn init -y
yarn add -D svelte vite @sveltejs/vite-plugin-svelte svench
mkdir src
echo '# Hello' > src/hello.md
echo '<h1>Hi!</h1>' > src/Hi.svench
yarn svench
```
