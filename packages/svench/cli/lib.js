/**
 * Re export curated parts of lib, for better portability of import paths.
 */

export { importAbsolute } from '../lib/util.js'

export { default as Log } from '../lib/log.js'

export { maybeDump, dumpAt } from '../lib/dump.js'

export { loadSvenchConfig } from '../lib/plugin-shared.js'

export { loadSvelteConfig } from '../lib/ecosystem.js'

export { inspect } from '../lib/inspect.js'

export { bundleRuntime, ensureRuntime } from '../lib/bundle.js'

export { importSync, resolve, resolveSync } from '../lib/import-relative.cjs'
