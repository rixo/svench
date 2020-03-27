import { createHarness, harness } from 'zorax'
import { indentedTapReporter } from 'zora-tap-reporter'

harness.auto(false)

const logReporter = () => async stream => {
  for await (const message of stream) {
    if (message.type === 'BAIL_OUT') {
      throw message.data
    }
    console.log(message)
  }
}

export default async pages => {
  const harness = createHarness({ auto: false, json: true })
  const { describe, test } = harness

  pages.map(page => {
    describe(page.path, () => {
      test('component loads', async t => {
        const cmp = await page.loader()
        t.ok(cmp)
      })
    })
  })

  // harness.report(logReporter())
  harness.report(
    indentedTapReporter({
      log: (...args) => {
        console.log(...args)
      },
    })
  )
}
