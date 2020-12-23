export const finalizeSnowpackOptions = ({ ...options }) => {
  if (!options.svenchDir) {
    throw new Error('svenchDir option is required with Snowpack')
  }
  return {
    ...options,
  }
}
