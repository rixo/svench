<script>
  export let value

  const colors = [
    { value: '@none', label: '' },
    { value: '#fff' },
    { value: '#000', dark: true },
    { value: '#f00', dark: true },
    { value: '#0f0' },
    { value: '#00f', dark: true },
    { value: '#ff0' },
    { value: '#f0f' },
    { value: '#0ff', dark: true },
    ...Array.from({ length: 21 })
      .map((_, i) => ({
        label: `${i * 5}%`,
        value: `hsl(0, 0%, ${i * 5}%)`,
        dark: i <= 10,
      }))
      .reverse(),
  ].map(x => ({ label: x.value, dark: false, ...x }))
</script>

<select bind:value>
  {#each colors as { value, label, dark } (value)}
    <option {value} class:dark style="background: {value};">{label}</option>
  {/each}
</select>

<style>
  select,
  option {
    font-family: monospace;
  }
  .pattern {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dOxDQBACAJA/b1Y54dyHRZzBQoLY6Am1xCS5A8hAErpvRiOQYMbwFSL6qM8isGTYAOhNQbW5Q4iGwAAAABJRU5ErkJggg==)
      repeat;
  }
  .light {
    color: #333;
  }
  .dark {
    color: #eee;
  }
</style>
