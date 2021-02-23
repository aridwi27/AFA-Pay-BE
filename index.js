const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const userRoute = require('./src/routes/users')

const app = express()


app.use(cors({
    origin: '*'
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(userRoute)
// open route for public image
app.use('/images', express.static('./public/images'))

require('dotenv').config()

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT}`)
})