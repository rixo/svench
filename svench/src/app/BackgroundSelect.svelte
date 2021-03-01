<script>
  import { isDark } from '../util-esm.js'

  export let value
  export let colors
  export let aliases

  const parseColor = x => {
    if (typeof x === 'string') return parseColor({ value: x })
    return {
      label: x.value,
      dark: isDark(x.value),
      ...x,
    }
  }

  $: _colors = [{ value: '@none', label: '' }, ...colors].map(parseColor)

  $: selected = _colors.find(x => x.value === value)

  const optionsAliases = {
    '@none': '#fff',
  }

  const renderBg = (value, isOptions) => {
    if (!value) return 'background: #fff'
    const bg = (isOptions && optionsAliases[value]) || aliases[value] || value
    return `background: ${bg}`
  }
</script>

<select
  bind:value
  style={renderBg(selected && selected.value)}
  class:dark={selected && selected.dark && false}
>
  {#each _colors as { value, label, dark, optionStyle } (value)}
    <option {value} class:dark style={renderBg(value, true)}>{label}</option>
  {/each}
</select>

<style>
  select,
  option {
    font-family: monospace;
    color: #333;
  }
  select {
    color: transparent;
    height: 22px;
    width: 42px;
    border-color: #c0c0c0;
  }
  .dark {
    color: #eee;
  }
</style>
