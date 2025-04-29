export default function (pool) {
    return {
        getNote(endpoint) {
            const result = pool.query("SELECT data FROM note_data WHERE endpoint_id = $1", [endpoint])
            return result
        }
    }
}
