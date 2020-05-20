import { get, writable } from 'svelte/store'

export default (cfg, previous) => {
  if (!cfg) return null

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
