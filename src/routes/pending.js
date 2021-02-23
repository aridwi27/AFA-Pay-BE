const express = require('express');

const { authentication } = require('../helpers/middleware/auth')

const Router = express.Router()

Router
  .post('/api/pending')
  .patch('/api/pending/:id') 
  .get('/api/pending/:id')

module.exports = Router