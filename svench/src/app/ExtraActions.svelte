<script>
  import { fade } from 'svelte/transition'
  import Prism from '../Prism.svelte'
  export let actions
</script>

<table>
  <colgroup>
    <col style="width: 120px" />
    <col style="width: 120px" />
    <col style="width: auto" />
  </colgroup>
  {#each actions.events as e (e.date)}
    <tr transition:fade|local>
      <td>{new Date(e.date).toLocaleTimeString()}</td>
      <td class="main">{e.event || ''}</td>
      <td>
        <Prism
          anim={false}
          language="js"
          code={e.data == null
            ? ' '
            : JSON.stringify(e.data).replace(/":/g, '": ')}
        />
      </td>
    </tr>
  {/each}
</table>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  td {
    font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono',
      monospace;
    padding: 0 1em;
  }
  tr:nth-child(odd) :global(pre),
  tr:nth-child(odd) td {
    background-color: rgba(255, 255, 255, 0.33);
  }
  td.main {
    font-weight: 500;
  }
</style>
