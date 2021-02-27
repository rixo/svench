const defaultPresets = ['svench/presets/vite']

export const finalizeViteOptions = ({ ...options }) => {
  if (!options.svenchDir) {
    throw new Error('svenchDir option is required with Vite')
  }
  return {
    ...options,
  }
}

export const parseViteSvenchifyOptions = ({
  presets = defaultPresets,
  ...options
}) => ({
  presets,
  ...options,
})
