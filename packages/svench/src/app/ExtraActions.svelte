<script>
  import { fade } from 'svelte/transition'
  import Prism from '../Prism.svelte'
  export let actions

  const extractEventCode = ({ data }) => {
    if (data) {
      const raw = data instanceof CustomEvent ? data.detail : data
      return JSON.stringify(raw).replace(/":/g, '": ')
    }
    return ' '
  }
</script>

<table>
  <colgroup>
    <col style="width: 120px" />
    <col style="width: 120px" />
    <col style="width: auto" />
  </colgroup>
  {#each actions.events as e (e.date)}
    <tr transition:fade|local>
      <td class="small">{new Date(e.date).toLocaleTimeString()}</td>
      <td class="main">{e.event || ''}</td>
      <td>
        <Prism anim={false} language="js" code={extractEventCode(e)} />
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
    vertical-align: baseline;
  }
  td.small {
    font-size: 0.8em;
  }
  tr:nth-child(odd) :global(pre),
  tr:nth-child(odd) td {
    background-color: rgba(255, 255, 255, 0.33);
  }
  td.main {
    font-weight: 500;
  }
</style>
