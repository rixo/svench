import { maybeDump, inspect, bundleRuntime } from '../lib.js'

export default async options => {
  const { target: targetOpt, dump, minify, prod } = options

  maybeDump('options', dump, options)

  const {
    svench: { version: svenchVersion },
    svelte: { compiler: svelteCompilerPath },
  } = await inspect(options)

  const target = targetOpt && targetOpt.split(',').map(x => x.trim())

  await bundleRuntime({
    target,
    svenchVersion,
    svelteCompilerPath,
    minify,
    prod,
  })
}
