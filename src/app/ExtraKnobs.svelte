<script>
  import ExtraKnobsInput from './ExtraKnobsInput.svelte'

  export let knobs
</script>

{#each knobs.fields as field (field.name)}
  <ExtraKnobsInput {knobs} {field} />
{/each}
