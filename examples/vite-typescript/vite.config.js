import svelte from '@svitejs/vite-plugin-svelte'
import preprocess from 'svelte-preprocess'

export default {
  plugins: [
    svelte({
      preprocess: preprocess({ typescript: true }),
    }),
  ],
}
