<script>
   import { View } from 'svench';
</script>

<svench:options title="Knobs" />

# Knobs

Knobs are used to interact with the View components.

## Defining and using knobs

Knobs are defined for a `View` via the `knobs` prop, and their current values are retrieved via `let:knobs`.

```svelte
<View
  name="defining and using a knob"
  knobs={{ someProp: "my default value" }}
  let:knobs={{someProp}}
>
    <p>someProp: {someProp}</p>
</View>
```

<View
  name="defining and using a knob"
  knobs={{ someProp: "my default value" }}
  let:knobs={{someProp}}
>
    <p>someProp: {someProp}</p>
</View>

## Knobs passed as plain objects

Knobs can be passed to the views as a plain object of knob names and their definitions. The props for the different types are shown in the table below.


| type      | props                           |
|-----------|---------------------------------|
| text      | `name`, `default`               |
| number    | `name`, `default`               |
| range     | `name`, `default`, `min`, `max` |
| bool      | `name`, `default`               |

```svelte
<View
  name="knobs as objects"
  knobs={{
    firstProp: { type: 'text', default: "hello world" },
    secondProp: { type: 'number', default: 123 }
  }}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>
```

<View
  name="knobs as objects"
  knobs={{
    firstProp: { type: 'text', default: "hello world" },
    secondProp: { type: 'number', default: 123 }
  }}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>

## Knobs passed as plain objects, shortcut notation

If a knob's value is not an object, it's taken as the default value of the knob, with the type of the knob infered from it.

Range knobs can be declared this way using a default value matching the format `${minValue}${maxValue};${initialValue}` (e.g., `-10-10;5`).


```svelte
<View
  name="knobs as objects, shortcut notation"
  knobs={{ firstProp: "hello world", secondProp: 123 }}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>
```

<View
  name="knobs as objects, shortcut notation"
  knobs={{ firstProp: "hello world", secondProp: 123 }}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>

## Knobs passed as an array

If the display order of the knobs matters, the knobs can also be defined via an array of knob definitions.

```svelte
<View
  name="knobs as array"
  knobs={[
    { name: 'firstProp', type: 'text', default: 'Hello world'},
    {name: 'secondProp', type: 'number', default: 123},
  ]}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>
```

<View
  name="knobs as array"
  knobs={[
    { name: 'firstProp', type: 'text', default: 'Hello world'},
    {name: 'secondProp', type: 'number', default: 123},
  ]}
  let:knobs={{firstProp, secondProp}}
>
    <p>firstProp: {firstProp}</p>
    <p>secondProp: {secondProp}</p>
</View>
