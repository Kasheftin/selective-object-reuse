const isNonNullObject = (value: unknown) => {
  return !!value && typeof value === 'object'
}

const isSpecial = (value: unknown) => {
  const stringValue = Object.prototype.toString.call(value)
  return stringValue === '[object RegExp]' || stringValue === '[object Date]'
}

const isDate = (value: unknown) => {
  return Object.prototype.toString.call(value) === '[object Date]'
}

const isRegExp = (value: unknown) => {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

const updateEntry = <T>(newEntry: T, oldEntry: unknown): [T, boolean] => {
  if (newEntry === oldEntry) {
    return [oldEntry as T, true]
  }
  if (!isNonNullObject(newEntry) || !isNonNullObject(oldEntry)) {
    return [newEntry, false]
  }
  if (isDate(newEntry) && isDate(oldEntry)) {
    if ((newEntry as unknown as Date).toString() === (oldEntry as Date).toString()) {
      return [oldEntry as T, true]
    } else {
      return [newEntry, false]
    }
  }
  if (isRegExp(newEntry) && isRegExp(oldEntry)) {
    if ((newEntry as unknown as RegExp).toString() === (oldEntry as RegExp).toString()) {
      return [oldEntry as T, true]
    } else {
      return [newEntry, false]
    }
  }
  if (isSpecial(newEntry) || isSpecial(oldEntry) || Object.isFrozen(newEntry)) {
    return [newEntry, false]
  }
  const newEntryObject = newEntry as Record<string, unknown>
  const oldEntryObject = oldEntry as Record<string, unknown>
  const newEntryKeys = Object.keys(newEntryObject)
  const oldEntryKeys = Object.keys(oldEntryObject)
  let entriesAreEqual = newEntryKeys.length === oldEntryKeys.length
  if (entriesAreEqual && !newEntryKeys.length && Array.isArray(newEntry) !== Array.isArray(oldEntry)) {
    entriesAreEqual = false
  }
  newEntryKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(oldEntryObject, key)) {
      const result = updateEntry(newEntryObject[key], oldEntryObject[key])
      if (result[1]) {
        newEntryObject[key] = result[0]
      } else {
        entriesAreEqual = false
      }
    }
  })
  if (entriesAreEqual) {
    return [oldEntryObject as T, true]
  } else{
    return [newEntryObject as T, false]
  }
}

export class SelectiveObjectReuse {
  stack: Record<string, unknown>

  constructor() {
    this.stack = {}
  }

  wrap<T>(newEntry: T, namespace = 'default'): T {
    const result = updateEntry(newEntry, this.stack[namespace])
    this.stack[namespace] = result[0]
    return result[0]
  }

  dispose (namespace = null) {
    if (namespace) {
      delete this.stack[namespace]
    } else {
      this.stack = {}
    }
  }
}
