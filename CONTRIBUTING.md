# Contributin to Svench

## Installation

```bash
git clone
cd svench
git checkout next # development is active on `next` branch currently
```

### Svench

```bash
cd packages/svench
yarn link
yarn
yarn dev # wathc & rebuild

# watch & rebuild only some parts
#
# targets: app, theme, rollup (rollup plugin), util-esm, prism
#
yarn dev --configTarget app,theme
```

### Example

```bash
cd example
yarn
yarn link svench
yarn svench # Rollup + rollup-plugin-hot
# or
yarn svench:nollup # Nollup
```
