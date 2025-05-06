import services from "../services/index.js"

export default async function (req, res) {
    const endpoint = req.params.endpoint
    const cache = await services.getFromCache(endpoint)
    if (cache) {
        if (cache) {
            res.json(cache)
            return
        }
        res.status(404).send("Not Found")
    }
    services.Note.getNote(endpoint).then(data => {
        res.json(data)
        services.saveToCache(endpoint, data)
    })
}
