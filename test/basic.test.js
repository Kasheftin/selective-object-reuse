const SelectiveObjectReuse = require('../index.js')

describe('Some basic set of tests', () => {
  let sor = null

  beforeEach(() => {
    sor = new SelectiveObjectReuse()
  })

  afterEach(() => {
    sor.dispose()
  })

  test('Static generator data reused entirely', () => {
    const getObject = () => [1, 2, 'test', { a: 'test' }]
    const data1 = sor.wrap(getObject())
    const data2 = sor.wrap(getObject())
    expect(data1).toBe(data2)
  })

  test(`Array + swapped entries is not reused, but it's object-like part reused`, () => {
    const getSubObject = () => ({ a: 'test' })
    const getObject = (i) => i ? [1, 2, getSubObject()] : [2, 1, getSubObject()]
    const data1 = sor.wrap(getObject(0))
    const data2 = sor.wrap(getObject(1))
    expect(data1).not.toBe(data2)
    expect(data1[2]).toBe(data2[2])
  })

  test('Object with swapped entries reused entirely', () => {
    const getObject = (i) => i ? { a: 1, b: 2 } : { b: 2, a: 1 }
    const data1 = sor.wrap(getObject(0))
    const data2 = sor.wrap(getObject(1))
    expect(data1).toBe(data2)
  })

  test('Nested object parts reused when equal', () => {
    const getSubObject = (n) => ({ a: n })
    const getObject = (i) => i ? { a: { b: getSubObject(0), c: { d: getSubObject(1), e: 1 } } } : { a: { b: getSubObject(0), c: { d: getSubObject(1), e: 2 } } }   
    const data1 = sor.wrap(getObject(0))
    const data2 = sor.wrap(getObject(1))
    expect(data1).not.toBe(data2)
    expect(data1.a).not.toBe(data2.a)
    expect(data1.a.b).toBe(data2.a.b)
    expect(data1.a.c).not.toBe(data2.a.c)
    expect(data1.a.c).not.toBe(data2.a.c)
    expect(data1.a.c.d).toBe(data2.a.c.d)
  })

  test('Namespaced objects do not intersect', () => {
    const getObject = (i) => i ? { a: 1 } : { b: 1 }
    const data1 = sor.wrap(getObject(0), 'a')
    const data2 = sor.wrap(getObject(0), 'a')
    const data3 = sor.wrap(getObject(1), 'b')
    const data4 = sor.wrap(getObject(1), 'b')
    expect(data1).toBe(data2)
    expect(data3).toBe(data4)
    expect(data1).not.toBe(data3)
  })
})
