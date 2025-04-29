import services from "../services/index.js"

export default async function (req, res) {
    const endpoint = req.params.endpoint
    let cache = await services.getFromCache(endpoint)
    if (cache) {
        cache = JSON.parse(cache)
        res.json(cache)
        return
    }
    services.Note.getNote(endpoint).then(result => {
        res.json(result)
    })
}
