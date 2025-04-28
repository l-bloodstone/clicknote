import Note from "./note_model.js"
import db from './db.js'
const pool = db.pool

export default {
    Note: Note(pool),
}
