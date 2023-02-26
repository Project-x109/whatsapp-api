const express = require('express')
const path = require('path')
const exceptionHandler = require('express-exception-handler')
exceptionHandler.handle()
const app = express()
const error = require('./middleware/error')
const tokenCheck = require('./middleware/tokenCheck')
const { protectRoutes } = require('./config')

app.use(express.json())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './pages'))
global.WhatsAppInstances = {}

const routes = require('./routes/')
if (protectRoutes) {
    app.use(tokenCheck)
}
  app.use('/', routes)
 app.use(error.handler)

module.exports = app