export const makeNamer = () => {
  const taken = {}
  let index = 0

  const defaultViewName = index => `View ${index}`

  const getRenderName = _name => {
    index++

    const wantedName = _name == null ? defaultViewName(index) : _name

    let name = wantedName
    if (taken[name]) {
      name = `${name} (${taken[wantedName]})`
    }

    taken[wantedName] = (taken[wantedName] || 0) + 1

    return name
  }

  return getRenderName
}
