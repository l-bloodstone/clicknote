import { Note } from "../services"

export default function (req, res) {
    const endpoint = req.param.endpoint
    res.json(Note.getNote(endpoint))
}
