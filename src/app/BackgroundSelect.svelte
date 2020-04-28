<script>
  export let value
</script>

<select bind:value>
  <option value="@none" class="pattern">None</option>
  <option value="#fff" class="light" style="background: #fff;">#fff</option>
  <option value="#000" class="dark" style="background: #000;">#000</option>
  <option value="#f00" class="dark" style="background: #f00;">#f00</option>
  <option value="#0f0" class="light" style="background: #0f0;">#0f0</option>
  <option value="#00f" class="dark" style="background: #00f;">#00f</option>
  <option value="#ff0" class="light" style="background: #ff0;">#ff0</option>
  <option value="#f0f" class="dark" style="background: #f0f;">#f0f</option>
  <option value="#0ff" class="light" style="background: #0ff;">#0ff</option>
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
