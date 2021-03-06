const isObject = require('is-mergeable-object')

function entriesAreEqual (entry1, entry2) {
  if (entry1 === entry2) {
    return true
  }
  if (!isObject(entry1) || !isObject(entry2)) {
    return false
  }
  const keys1 = Object.keys(entry1)
  const keys2 = Object.keys(entry2)
  if (keys1.length !== keys2.length) {
    return false
  }
  return !keys1.some((key1) => {
    if (!Object.prototype.hasOwnProperty.call(entry2, key1)) {
      return true
    }
    return !entriesAreEqual(entry1[key1], entry2[key1])
  })
}

function updateEntry (newEntry, oldEntry) {
  if (newEntry !== oldEntry && isObject(newEntry) && isObject(oldEntry)) {
    const keys = Object.keys(newEntry)
    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(oldEntry, key) && isObject(newEntry[key]) && isObject(oldEntry[key])) {
        if (entriesAreEqual(newEntry[key], oldEntry[key])) {
          newEntry[key] = oldEntry[key]
        } else {
          updateEntry(newEntry[key], oldEntry[key])
        }
      }
    })
  }
  return newEntry
}

class SelectiveObjectReuse {
  constructor() {
    this.stack = {}
  }

  wrap (newEntry, namespace = 'default') {
    if (isObject(newEntry) && isObject(this.stack[namespace]) && newEntry !== this.stack[namespace]) {
      if (entriesAreEqual(newEntry, this.stack[namespace])) {
        return this.stack[namespace]
      }
      newEntry = updateEntry(newEntry, this.stack[namespace])
    }
    this.stack[namespace] = newEntry 
    return newEntry
  }

  dispose (namespace = null) {
    if (namespace) {
      delete this.stack[namespace]
    } else {
      this.stack = {}
    }
  }
}

module.exports = SelectiveObjectReuse
exports.SelectiveObjectReuse = SelectiveObjectReuse