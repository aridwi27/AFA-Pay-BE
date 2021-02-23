const express = require('express');

const { authentication } = require('../helpers/middleware/auth')

const Router = express.Router()

Router
  .post('/api/transactions')
  .patch('/api/transactions/:id') 
  .get('/api/transactions/:id') //specific transactions
  .get('/api/transactions') //all transactions

module.exports = Router