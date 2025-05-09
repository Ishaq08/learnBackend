const express = require("express")
const app = express();
const port = 4000

app.get('/', (req, res) => {
    res.send("hello")
})

app.get('/twitter', (req, res) => {
    res.send("twitter")
})

app.get('/login', (req, res) => {
    res.send('<h1>login at xyz</h1>')
})

app.get('/youtube', (req, res) => {
    res.send("Backend Video")
})

app.listen(port, () => {
    console.log(`Expample app listening on port ${port}`);
})