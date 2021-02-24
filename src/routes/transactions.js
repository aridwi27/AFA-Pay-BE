const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { confTrans, allTrans, detailTrans, addTrans } = require('../controllers/transactions')

const Router = express.Router()

Router
  .post('/api/transaction/', authentication, addTrans)
  .patch('/api/transaction/:id', authentication, confTrans)
  .get('/api/transaction', allTrans) //all transactions
  .get('/api/transaction/:id', authentication, detailTrans) //specific transactions
  // .patch('/api/transaction/:id') 

module.exports = Router