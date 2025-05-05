import express from 'express'
import Router from "./src/router/index.js"

const app = express()
app.use(express.json())

app.use("/api/v1", Router)

app.use((_req, res) => {
    res.send("404 Not Found!")
})

app.listen(3000, "127.0.0.3")
