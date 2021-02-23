const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { confirmTrans, allTrans, detailTrans } = require('../controllers/transactions')

const Router = express.Router()

Router
  .post('/api/transaction/:id', confirmTrans)
  .get('/api/transaction', allTrans) //all transactions
  .get('/api/transaction/:id', detailTrans) //specific transactions
  // .patch('/api/transaction/:id') 

module.exports = Router