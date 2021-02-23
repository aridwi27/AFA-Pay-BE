const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { addPending, detailPending, deletePending, allPending } = require('../controllers/pending')

const Router = express.Router()

Router
  .post('/api/pending', addPending)
  .get('/api/pending/:id', detailPending) 
  .delete('/api/pending/:id', deletePending) 
  .get('/api/pending/', allPending)

module.exports = Router