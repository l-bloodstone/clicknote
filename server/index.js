globalThis.Config = require("./config.js")
const express = require("express")
const Router = require("./src/router")

const app = express()

app.use(express.json())

app.use("/api/v1", Router)

app.use((_req, res) => {
    res.send("404 Not Found!")
})

app.listen(3000)
