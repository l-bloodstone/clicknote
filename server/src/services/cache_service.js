import { createClient } from 'redis'
const cache = createClient()
await cache.connect()

export default {
    cache(key, hashtable = "notes") {
        return cache.hGet(hashtable, key)
    },

    saveToCache(key, hashtable = "notes") {
        return cache.hSet(hashtable, key)
    }
}
