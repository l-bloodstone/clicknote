import Note from "./note_service.js"
import Cache from "./cache_service.js"

export default {
    Note,
    getFromCache: Cache.cache,
    saveToCache: Cache.saveToCache,
}
