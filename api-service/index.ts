import express from "express"


const app = express()
const port = 8081
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
app.get("/", (req, res) => {})
