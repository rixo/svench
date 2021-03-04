<script lang="ts">
  import { onMount } from 'svelte'

  let i: int = 0 // <------ HERE, TS!

  onMount(() => {
    const interval = setInterval(() => i++, 1000)
    return () => clearInterval(interval)
  })
</script>

<div>
  <h2>I'm all TS n' all</h2>
  <pre>{i}</pre>
</div>

<style>
  div {
    text-align: center;
    padding: 1rem 2rem;
    font-family: sans-serif;
  }
</style>
