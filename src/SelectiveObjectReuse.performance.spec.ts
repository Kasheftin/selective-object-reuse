import { SelectiveObjectReuse } from './SelectiveObjectReuse'

const createHugeObject = (nestingLevel: number, propsCount: number, stringLength: number) => {
  const obj: Record<string, unknown> = {}
  for (let i = 0; i < propsCount; i++) {
    obj[`prop${i}`] = nestingLevel ? createHugeObject(nestingLevel - 1, propsCount, stringLength) : 't'.repeat(stringLength)
  }
  return obj
}

let sor = new SelectiveObjectReuse()

beforeEach(() => {
  sor = new SelectiveObjectReuse()
})

afterEach(() => {
  sor.dispose()
})

test('Performance measurement for a huge object', () => {
  console.time('perf')
  const data1 = sor.wrap(createHugeObject(6, 8, 8))
  const data2 = sor.wrap(createHugeObject(6, 8, 8)) 
  console.timeEnd('perf')
  expect(data1).toBe(data2)
})
