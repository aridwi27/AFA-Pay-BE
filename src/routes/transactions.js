const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { confirmTrans } = require('../controllers/transactions')

const Router = express.Router()

Router
  .post('/api/transaction/:id', confirmTrans)
  // .patch('/api/transaction/:id') 
  // .get('/api/transaction/:id') //specific transactions
  // .get('/api/transaction') //all transactions

module.exports = Router