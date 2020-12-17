export const findCurrentItem = (route, items) => {
  const targetPath = route.path.endsWith('/index')
    ? route.path.slice(0, -'/index'.length) || '/'
    : route.path
  if (targetPath === '/' || targetPath === '/index') {
    return items.find(item => ['/', '/index'].includes(item.path))
  }
  return items.find(item => item.path === targetPath)
}
