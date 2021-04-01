/**
 * Testing the xample app itself.
 */

// import { Selector } from 'testcafe'
import { startFixture } from './util/start.js'

// const macro = ({ expected }) => async t => {
//   const h1 = await Selector('.svench-app-canvas h1')
//   await t.expect(h1.innerText).eql(expected)
// }

startFixture(fixture, 'example').meta({
  feat: 'index',
})

// test.page`http://localhost:4242/`(
//   'loads /',
//   macro({ expected: 'Hello index.svench :D' })
// )
