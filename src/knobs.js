import { get, writable } from 'svelte/store'

const parseValueType = value => {
  let type = typeof value
  if (typeof value === 'string') {
    const match = /^(\d+)-(\d+)$/.exec(value)
    if (match) {
      const [, a, z] = match
      value = a / z
      type = 'range'
    }
  }
  return { value, type }
}

const parseConfig = cfg => {
  if (typeof cfg === 'object' && !Array.isArray(cfg)) {
    return Object.entries(cfg).map(([name, value]) => {
      return {
        name,
        ...parseValueType(value),
      }
    })
  } else {
    return cfg
  }
}

export default (cfg, previous) => {
  if (!cfg) return null

  cfg = parseConfig(cfg)

  const $previous = previous && get(previous)

  const knobs = writable(
    Object.fromEntries(
      cfg.map(({ name, default: defaultValue = undefined }) => [
        name,
        $previous ? $previous[name] : defaultValue,
      ])
    )
  )

  knobs.fields = cfg.map(({ name, type = 'text', ...props }) => ({
    name,
    type,
    ...props,
  }))

  return knobs
}
