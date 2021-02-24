const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { confirmTrans, allTrans, detailTrans } = require('../controllers/transactions')

const Router = express.Router()

Router
  .post('/api/transaction/:id', authentication, confirmTrans)
  .get('/api/transaction', authentication, allTrans) //all transactions
  .get('/api/transaction/:id', authentication, detailTrans) //specific transactions
  // .patch('/api/transaction/:id') 

module.exports = Router