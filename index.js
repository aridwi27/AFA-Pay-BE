const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const userRoute = require('./src/routes/users')
const transactionRoute = require('./src/routes/transactions')
// History Router
const history = require('connect-history-api-fallback')
const app = express()


app.use(cors({
    origin: '*'
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(userRoute)
app.use(transactionRoute)
// open route for public image
app.use('/images', express.static('./public/images'))

// API History
app.use(history({
    verbose: true
}))


// Deploy FrontEndPath
app.use('/', express.static('./dist'))

require('dotenv').config()

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT}`)
})