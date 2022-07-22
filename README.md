# Selective Object Reuse

Simple javascript object wrapper that recursively substitutes object-like properties if they match the previously stored values.

https://www.npmjs.com/package/selective-object-reuse

```
npm i --save selective-object-reuse
```

### Simple Example

```javascript
const a = { v: 1, obj: { test: 1 } }
const b = { v: 2, obj: { test: 1 } }

console.log(a === b) // False
console.log(a.obj === b.obj) // False
```

but

```javascript
import { SelectiveObjectReuse } from 'selective-object-reuse'

const sor = new SelectiveObjectReuse()

const a = sor.wrap({ v: 1, obj: { test: 1 } })
const b = sor.wrap({ v: 2, obj: { test: 1 } })

console.log(a === b) // False
console.log(a.obj === b.obj) // True
```

### Vue/Vuex Example

Let's consider some vue/vuex app that has to draw a list of users with tags (many-to-many relation). That's how the state may look like:

```javascript

export const state = () => ({
  userIds: [1, 2, 3]
  users: { 
    1: { id: 1, name: 'First' },
    2: { id: 2, name: 'Second' },
    3: { id: 3, name: 'Third' }
  },
  tags: {
    1: { id: 1, name: 'Red' },
    2: { id: 2, name: 'Blue' }
  },
  userTags: [
    { userId: 1, tagId: 1 },
    { userId: 1, tagId: 2 },
    { userId: 2, tagId: 1 }
  ]
})


export const getters = {
  usersWithTags: (state) => state.userIds.map(userId => ({
    id: userId,
    user: state.users[userId],
    tags: userTags
      .filter(userTag => userTag.userId === userId)
      .map(userTag => state.tags[userTag.tagId])
  }))
}
```

Every time when the state changes, the getter builds a new array consisting on new objects having `tags` property that is a new array.

```HTML
<template>
  <UserWithTags
    v-for="userWithTags in $store.getters.usersWithTags"
    :key="userWithTags.id"
    :user="userWithTags.user"
    :tags="userWithTags.tags"
  />
</template>
```

Every time when one new user<->tag relation is created, every `<UserWithTags>` component is updated because it refers to the new `tags` array. It happens even for users without tags.

Selective Object Reuse solves this issue. It wraps any object, and when the last is recreated it recursively replaces unchanged parts back with currently stored objects.

```html
<template>
  <UserWithTags
    v-for="userWithTags in $store.getters.usersWithTags"
    :key="userWithTags.id"
    :user="userWithTags.user"
    :tags="sor.wrap(userWithTags.tags)"
  />
</template>

<script>
import { SelectiveObjectReuse } from 'selective-object-reuse'

export default {
  data() {
    return {
      sor: new SelectiveObjectReuse()
    }
  }
}
</script>
```


### Read More

[Better Vue performance with Selective Object Reuse](https://teamhood.com/engineering/better-vue-performance-with-selective-object-reuse/)
