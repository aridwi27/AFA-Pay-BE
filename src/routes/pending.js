const express = require('express');

const { authentication } = require('../helpers/middleware/auth')
const { addPending, detailPending, deletePending, allPending } = require('../controllers/pending')

const Router = express.Router()

Router
  .post('/api/pending', authentication, addPending)
  .get('/api/pending/:id',authentication, detailPending) 
  .delete('/api/pending/:id',authentication, deletePending) 
  .get('/api/pending/',authentication, allPending)

module.exports = Router