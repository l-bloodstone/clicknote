import models from "../models/index.js"

export default {
    getNote(endpoint) {
        return models.Note.getNote(endpoint)
    }
}
