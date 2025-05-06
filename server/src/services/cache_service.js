import { createClient } from 'redis'
const cache = createClient()
await cache.connect()

export default {
    async cache(key, hashtable = "notes") {
        let cachedData = await cache.hGet(hashtable, key)
        if (cachedData != null) {
            cachedData = JSON.parse(cachedData)
            return cachedData
        }
        return false
    },

    async saveToCache(key, data, hashtable = "notes") {
        const status = await cache.hSet(hashtable, key, JSON.stringify(data))
        if (status) {
            return true
        }
        return false
    }
}
