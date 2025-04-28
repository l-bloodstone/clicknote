export default function (pool) {
    return {
        async getNote(endpoint) {
            let result = pool.query("SELECT data FROM note_data WHERE endpoint_id = $1", [endpoint])
            console.log(endpoint)
            return result
        }
    }
}
