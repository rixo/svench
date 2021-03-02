import svelte from '@svitejs/vite-plugin-svelte'
// import svelte from 'rollup-plugin-svelte-hot'

export default {
  plugins: [
    svelte({
      hot: true,
    }),
  ],
}
