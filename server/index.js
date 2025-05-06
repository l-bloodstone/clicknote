import express from 'express'
import Router from "./src/router/index.js"
import * as cluster from 'node:cluster'
import process from 'node:process'



if (cluster.isPrimary) {
    console.log(`Primary: ${process.pid}`)
    for (let i = 0; i < 8; i++) {
        cluster.fork()
        console.log(`Forked: ${i}`)
    }
} else {
    const app = express()
    app.use(express.json())
    app.use("/api/v1", Router)
    app.use((_req, res) => {
        res.send("404 Not Found!")
    })
    app.listen(3000, "127.0.0.3")
}

