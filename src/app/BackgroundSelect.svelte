<script>
  import { isDark } from '../util-esm.js'

  export let value
  export let colors

  const parseColor = x => {
    if (typeof x === 'string') return parseColor({ value: x })
    return {
      label: x.value,
      dark: isDark(x.value),
      ...x,
    }
  }

  $: _colors = [{ value: '@none', label: '' }, ...colors].map(parseColor)
</script>

<select bind:value>
  {#each _colors as { value, label, dark } (value)}
    <option {value} class:dark style="background: {value};">{label}</option>
  {/each}
</select>

<style>
  select,
  option {
    font-family: monospace;
    color: #333;
  }
  .dark {
    color: #eee;
  }
</style>
