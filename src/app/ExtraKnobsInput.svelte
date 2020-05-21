<script>
  export let knobs
  export let field

  $: ({ type, name, label, ...props } = field)

  $: label = field.label || field.name
</script>

<label>
  <span>{field.label || field.name}</span>
  {#if type === 'number'}
    <input type="number" bind:value={$knobs[field.name]} {...props} />
  {:else if type === 'range'}
    <input type="range" bind:value={$knobs[field.name]} {...props} />
  {:else if type === 'bool' || type === 'boolean' || type === 'checkbox'}
    <input type="checkbox" bind:checked={$knobs[field.name]} {...props} />
  {:else}
    <input bind:value={$knobs[field.name]} {...props} />
  {/if}
</label>

<style>
  label {
    display: block;
    margin: 0.25em 0.5em;
  }
  label span {
    display: inline-block;
    width: 6.66em;
  }
</style>
