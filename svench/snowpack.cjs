require('source-map-support').install();
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var pluginShared = require('./dist/plugin-shared.cjs');
require('fs');
require('cheap-watch');
require('util');
require('module');
require('vm');
require('internal/bootstrap/loaders');
require('svelte/compiler');

/**
 *     import { svenchify } from 'svench/snowpack'
 *
 *     module.exports = svenchify('snowpack.config.js', {
 *       ...
 *     })
 */

const isSveltePlugin = x =>
  Array.isArray(x) ? isSveltePlugin(x[0]) : x === '@snowpack/plugin-svelte';

const wrapSveltePlugin = options => plugin => {
  if (!isSveltePlugin(plugin)) return plugin
  const [sveltePlugin, svelte] = Array.isArray(plugin) ? plugin : [plugin, {}];
  return [pluginShared.SNOWPACK_PLUGIN, { sveltePlugin, svelte, ...options }]
};

var snowpackSvenchify = (snowpackConfig, svenchifyOptions = true) => {
  const enabled =
    svenchifyOptions === true || (svenchifyOptions && svenchifyOptions.enabled);

  if (!enabled) return snowpackConfig

  return {
    ...snowpackConfig,
    plugins: snowpackConfig.plugins.map(
      wrapSveltePlugin({ enabled, ...svenchifyOptions })
    ),
  }
};

const defaultPresets = 'svench/presets/snowpack';

const uniq = arr => [...new Set(arr)];

const resolveSveltePlugin = x =>
  typeof x === 'function' ? x : require.main.require(x);

const initSvench = ({ options, routix }) => async ({ isDev }) => {
  const {
    manifest,
    index: indexCfg,
    manifestDir,
    publicDir,
    entryFile,
  } = options;

  // --- Manifest ---

  const runManifest = async () => {
    if (!manifest) return
    await pluginShared.writeManifest(options);
  };

  // --- Index ---

  const runIndex = async () => {
    if (!indexCfg) return
    await pluginShared.createIndex(indexCfg, {
      watch: isDev,
      script: '/_svench_/' + path.basename(entryFile),
      publicDir,
    });
  };

  const startRoutix = async () => {
    await pluginShared.mkdirp(manifestDir);
    await routix.start({ watch: isDev });
    // await routix.onIdle(100) // report init errors
  };

  await Promise.all([runIndex(), runManifest(), startRoutix()]);
};

const autoMount = ({ manifestDir, publicDir }, snowpackConfig) => {
  const { mount } = snowpackConfig;

  const mountEntries = [[path.resolve(publicDir), { url: '/', static: true }]];

  let manifestDirEntry = [
    path.resolve(manifestDir),
    { url: '/_svench_', resolve: true, static: false },
  ];

  for (const [target, spec] of Object.entries(mount)) {
    if (manifestDirEntry && !spec.static) {
      mountEntries.push(manifestDirEntry);
      manifestDirEntry = null;
    }
    mountEntries.push([target, spec]);
  }

  if (manifestDirEntry) {
    mountEntries.push(manifestDirEntry);
  }

  return Object.fromEntries(mountEntries)
};

const plugin = (snowpackConfig, pluginOptions = {}) => {
  const { svelte: sveltePluginOptions, ...svenchOptions } = pluginOptions;

  let resolveRouteImport = x => x;

  const parts = pluginShared.createPluginParts({
    presets: defaultPresets,
    ...svenchOptions,
    resolveRouteImport: (...args) => resolveRouteImport(...args),
  });

  const {
    options: {
      enabled,
      sveltePlugin = '@snowpack/plugin-svelte',
      dump,
      dir,
      port,
      extensions,
      snowpack: override,
    },
  } = parts;

  const _sveltePlugin = resolveSveltePlugin(sveltePlugin);

  // --- Guard: Svench disabled ---

  if (!enabled) {
    return _sveltePlugin(snowpackConfig, sveltePluginOptions)
  }

  // --- Svench enabled ---

  sveltePluginOptions.preprocess = {
    markup: parts.preprocess.pull,
  };

  if (port) {
    snowpackConfig.devOptions = {
      ...snowpackConfig.devOptions,
      port,
    };
  }

  if (override) {
    const { mount, ...others } = override;

    if (mount === true) {
      snowpackConfig.mount = autoMount(parts.options, snowpackConfig);
    } else if (mount) {
      snowpackConfig.mount = mount;
    }

    for (const [key, value] of Object.entries(others)) {
      if (key.endsWith('Options')) {
        snowpackConfig[key] = { ...snowpackConfig[key], ...value };
      } else {
        snowpackConfig[key] = value;
      }
    }
  }

  const distDir = path.resolve(dir);
  const mountEntry = snowpackConfig.mount[distDir];
  if (mountEntry) {
    const { url } = mountEntry;
    resolveRouteImport = x => url + '/' + path.relative(distDir, x);
  }

  const hooks = _sveltePlugin(snowpackConfig, sveltePluginOptions);

  hooks.resolve.input = uniq([
    ...hooks.resolve.input,
    ...extensions.map(x => '.' + x.split('.').pop()),
  ]);

  hooks.knownEntrypoints = uniq([
    ...hooks.knownEntrypoints,
    'svench',
    // TODO only if enabled in manifest:
    'svench/src/app/index.js',
    'svench/themes/default.css',
    'svench/themes/default-markdown.css',
  ]);

  return {
    ...hooks,
    name: pluginShared.SNOWPACK_PLUGIN,
    config: pluginShared.maybeDump('config', dump),
    run: initSvench(parts),
  }
};

exports.default = plugin;
exports.plugin = plugin;
exports.svenchify = snowpackSvenchify;
//# sourceMappingURL=snowpack.cjs.map
