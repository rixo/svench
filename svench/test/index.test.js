import { Selector } from 'testcafe'
import { startFixture } from './util/start.js'

const macro = ({ expected }) => async t => {
  const h1 = await Selector('.svench-app-canvas h1')
  await t.expect(h1.innerText).eql(expected)
}

startFixture(fixture, 'index.svench').meta({
  feat: 'index',
})

test.page`http://localhost:4243/`(
  'loads /',
  macro({ expected: 'Hello index.svench :D' })
)

test.page`http://localhost:4243/index`(
  'loads /index',
  macro({ expected: 'Hello index.svench :D' })
)

startFixture(fixture, 'index.svx').meta({
  feat: 'index',
})

test.page`http://localhost:4244/`(
  'loads /',
  macro({ expected: 'Hello index.svench.svx' })
)

test.page`http://localhost:4244/index`(
  'loads /index',
  macro({ expected: 'Hello index.svench.svx' })
)

startFixture(fixture, 'index.svench+svx').meta({
  feat: 'index',
})

test.page`http://localhost:4245/`('loads /', macro({ expected: 'Hello SVX' }))

test.page`http://localhost:4245/`(
  'loads /index',
  macro({ expected: 'Hello SVX' })
)

startFixture(fixture, 'index.dir+index').meta({
  feat: 'index',
})

test.only.page`http://localhost:4246/`('loads /', async t => {
  const h1 = await Selector('.svench-app-canvas h1.svench-content')
  const menuItem = await Selector('.svench-menu-item-text')
  await t.expect(h1.innerText).eql('dir with index')
  await t.expect(menuItem.innerText).eql('index')
})

// test.page`http://localhost:4245/`(
//   'loads /index',
//   macro({ expected: 'Hello SVX' })
// )
