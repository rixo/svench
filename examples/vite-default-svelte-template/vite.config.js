import svelte from 'rollup-plugin-svelte-hot'

export default ({ command, mode }) => {
  const isProduction = mode === 'production'
  const isServe = command === 'serve'
  const hot = !isProduction && isServe
  return {
    root: 'src',
    plugins: [
      svelte({
        emitCss: true,
      }),
    ],
    build: {
      minify: isProduction,
    },
  }
}
