import { SelectiveObjectReuse } from './SelectiveObjectReuse'

let sor = new SelectiveObjectReuse()

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
  const getObject = (i: number) => i ? [1, 2, getSubObject()] : [2, 1, getSubObject()]
  const data1 = sor.wrap(getObject(0))
  const data2 = sor.wrap(getObject(1))
  expect(data1).not.toBe(data2)
  expect(data1[2]).toBe(data2[2])
})

test('Object with swapped entries reused entirely', () => {
  const getObject = (i: number) => i ? { a: 1, b: 2 } : { b: 2, a: 1 }
  const data1 = sor.wrap(getObject(0))
  const data2 = sor.wrap(getObject(1))
  expect(data1).toBe(data2)
})

test('Nested object parts reused when equal', () => {
  const getSubObject = (n: number) => ({ a: n })
  const getObject = (i: number) => i ? { a: { b: getSubObject(0), c: { d: getSubObject(1), e: 1 } } } : { a: { b: getSubObject(0), c: { d: getSubObject(1), e: 2 } } }   
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
  const getObject = () => ({ a: 1 })
  const data1 = sor.wrap(getObject(), 'a')
  const data2 = sor.wrap(getObject(), 'a')
  const data3 = sor.wrap(getObject(), 'b')
  const data4 = sor.wrap(getObject(), 'b')
  expect(data1).toBe(data2)
  expect(data3).toBe(data4)
  expect(data1).not.toBe(data3)
})

test('Frozen objects have to be skipped', () => {
  const obj1 = Object.freeze({
    id: 1,
    data: {
      a: 1
    }
  })
  const obj2 = Object.freeze({
    id: 2,
    data: {
      a: 1
    }
  })
  const obj3 = {
    id: 2,
    data: {
      a: 1
    }
  }
  const data1 = sor.wrap(obj1, 'item')
  const data2 = sor.wrap(obj2, 'item')
  const data3 = sor.wrap(obj3, 'item')
  expect(data1).not.toBe(data2)
  expect(data1.data).not.toBe(data2.data)
  expect(data3).toBe(data2)
})

test('Empty array and empty object are not equal', () => {
  const data1 = sor.wrap({ a: [] })
  const data2 = sor.wrap({ a: {} })
  expect(data1).not.toBe(data2)
})

test('Should work for Date/Regex type', () => {
  const data1 = sor.wrap({ a: 1, obj: { d: new Date(1234567891011), r: /abc/ } })
  const data2 = sor.wrap({ a: 2, obj: { d: new Date(1234567891011), r: /abc/ } })
  const data3 = sor.wrap(/asd/, 'regex')
  const data4 = sor.wrap(/asd/, 'regex')
  expect(data1).not.toBe(data2)
  expect(data1.obj).toBe(data2.obj)
  expect(data3).toBe(data4)
})
