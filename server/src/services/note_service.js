import models from "../models/index.js"

export default {
    async getNote(endpoint) {
        const note = {
            endpoint: endpoint,
        }
        const queryData = await models.Note.getNote(endpoint)
        // if there are no rows returned then return `false`
        if (queryData.rows.length === 0) {
            return false
        }
        note.data = queryData.rows[0].data
        return note
    }
}
