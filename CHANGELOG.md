# Svench changelog

## 0.1.0

- Rollup Svenchify to automagically convert a `rollup.config.js` to Svench

- Snowpack plugin
- Snowpack svenchify to convert a `snowpack.config.js` to Svench

- presets support (builtin presets for Rollup & Snowpack)

### Breaking changes

- `svench/svench.js` has been removed: use option `entry` to create your entrypoint automatically instead

- `svench/app.*` has been removed -- you probably weren't using that, it was only useful with abandoned shadow DOM approach
