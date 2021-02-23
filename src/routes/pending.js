const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { addTrans, detailTrans, deleteTrans, allTrans } = require('../controllers/pending')

const Router = express.Router()

Router
  .post('/api/pending', authentication, addTrans)
  .get('/api/pending/:id',authentication, detailTrans) 
  .delete('/api/pending/:id',authentication, deleteTrans) 
  .get('/api/pending/',authentication, allTrans)

module.exports = Router