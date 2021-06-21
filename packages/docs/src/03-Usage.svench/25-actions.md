<script>
   import { View } from 'svench';
   import CustomAction from './CustomAction.svelte';

</script>

<svench:options title="Actions" />

# Actions

Svench Views provides an easy way to capture and display events. 

If a view uses the slot prop `action`, an *Actions* tab will appear at the
bottom of the Svench UI. The value provided by the slot prop `action` is a
function with the signature `(eventName, data) => void` or
`eventName => event => void`. 

```svelte
<script>
  // CustomAction.svelte

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const doIt = () => dispatch( 'customEvent', {
    payload: 'blah blah'
  } );
</script>

<button on:click={doIt}>trigger custom event</button>
```

<View name="action" let:action>

    <button on:click={action('click button')}>Click me</button>

    <CustomAction on:customEvent={ ({detail}) =>
        action('Custom', detail)
    } />

</View>
