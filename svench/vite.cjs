require('source-map-support').install();
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginShared = require('./dist/plugin-shared.cjs');
var svenchify$1 = require('./dist/svenchify.cjs');
require('fs');
require('path');
require('cheap-watch');
require('util');
require('module');
require('vm');
require('internal/bootstrap/loaders');
require('svelte/compiler');

const defaultPresets = ['svench/presets/vite'];

const isSveltePlugin = x =>
  (x && x.name === 'svelte') || /\bvite-plugin-svelte\b/.test(x.name);

const initSvench = async ({ options, routix }, { command }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryUrl,
  } = options;

  const watch = command === 'serve';

  const runManifest = async () => {
    if (!manifest) return
    await pluginShared.writeManifest(options);
  };

  const runIndex = async () => {
    if (!indexCfg) return
    await pluginShared.createIndex(indexCfg, {
      watch,
      script: entryUrl,
      publicDir,
    });
  };

  const startRoutix = async () => {
    await pluginShared.mkdirp(manifestDir);
    await routix.start({ watch });
    await routix.onIdle(100); // report init errors
  };

  await Promise.all([runIndex(), runManifest(), startRoutix()]);
};

const createPlugin = parts => {
  const {
    options,
    options: { enabled, svenchDir: root, port, dump, vite = {} },
  } = parts;

  pluginShared.maybeDump('options', dump, options);

  if (!enabled) {
    return { name: `${pluginShared.VITE_PLUGIN_NAME}:disabled` }
  }

  let env;

  return {
    name: pluginShared.VITE_PLUGIN_NAME,

    config(config, _env) {
      env = _env;
      return {
        root,
        ...vite,
        server: {
          port,
          ...vite.server,
        },
        // TODO $svench alias?
        // resolve: {
        //   alias: {
        //     $svench: entryFile,
        //     ...(vite.resolve && vite.resolve.alias),
        //   },
        //   ...vite.resolve,
        // },
      }
    },

    configResolved(config) {
      pluginShared.maybeDump('config', dump, config);
    },

    async options() {
      await initSvench(parts, env);
    },
  }
};

const svenchVitePlugin = pluginShared.pipe(
  options => ({ presets: defaultPresets, ...options }),
  pluginShared.createPluginParts,
  createPlugin
);

const svenchify = svenchify$1.Svenchify(
  defaultPresets,
  async (
    { plugins: [...plugins] = [], ...config },
    parts,
    { wrapSvelteConfig }
  ) => {
    const {
      options: {
        defaultSveltePlugin,
        sveltePlugin = defaultSveltePlugin,
        svelte = {},
        vite: { clearScreen = config.clearScreen, server } = {},
      },
    } = parts;

    const hasSveltePlugin = plugins.some(isSveltePlugin);
    if (!hasSveltePlugin) {
      pluginShared.Log.info('Inject svelte plugin: %s', sveltePlugin);
      const plugin = await pluginShared.importRelative_1.importDefaultRelative(sveltePlugin);
      plugins.unshift(plugin(wrapSvelteConfig(svelte)));
    }

    const svenchPlugin = createPlugin(parts);
    plugins.unshift(svenchPlugin);

    return {
      ...config,
      plugins,
      clearScreen,
      server: {
        ...config.server,
        ...server,
      },
    }
  },
  getConfig => getConfig
);

exports.default = svenchVitePlugin;
exports.svenchify = svenchify;
//# sourceMappingURL=vite.cjs.map
