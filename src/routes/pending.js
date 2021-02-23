const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { addTrans, detailTrans } = require('../controllers/pending')

const Router = express.Router()

Router
  .post('/api/pending', addTrans)
  .get('/api/pending/:id', detailTrans) 
  // .get('/api/pending/:id')

module.exports = Router