<script>
   import { View } from 'svench';
   import CustomAction from './CustomAction.svelte';
</script>

<svench:options title="Actions" />

# Actions

Svench Views provides an easy way to capture and display events.

If a view uses the slot prop `let:action`, an *Actions* tab will appear at the bottom of the Svench UI.

The value provided by `let:action` is a function with one of the following signature, depending on the number of arguments that are passed to it:

```ts
(eventName: string, data: any) => void
```

or (curried form of the previous one):

```ts
(eventName: string) => (data: any) => void
```

## Example

```svelte
<View name="action" let:action>

    <button on:click={({ ctrlKey }) => action('button click', { ctrlKey })}>
      Click me (1)
    </button>

    <button on:click={action('button click')}>Click me (2)</button>

    <CustomAction
      on:click={action('click')}
      onClick={action('onClick')}
    />

</View>
```

_(Enter the view by clicking on its title, then click the buttons to see the effect!)_

<View name="action" let:action>

    <button on:click={({ ctrlKey }) => action('button click', { ctrlKey })}>
      Click me (1)
    </button>

    <button on:click={action('button click')}>Click me (2)</button>

    <CustomAction
      on:click={action('click')}
      onClick={action('onClick')}
    />

</View>
