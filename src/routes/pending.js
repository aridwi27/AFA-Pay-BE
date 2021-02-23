const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { addTrans, detailTrans, deleteTrans, allTrans } = require('../controllers/pending')

const Router = express.Router()

Router
  .post('/api/pending', addTrans)
  .get('/api/pending/:id', detailTrans) 
  .delete('/api/pending/:id', deleteTrans) 
  .get('/api/pending/', allTrans)

module.exports = Router