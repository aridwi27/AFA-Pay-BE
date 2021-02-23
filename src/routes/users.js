const express = require('express');

const { userReg,
        login,
        updateUser,
        getDetailUser } = require('../controllers/users');

const { authentication } = require('../helpers/middleware/auth')

const singleUpload = require('../helpers/middleware/upload')

const Router = express.Router()

Router
  .post('/api/register', userReg) //all access
  .post('/api/login', login)  //all access
  .patch('/api/user/:id', authentication, singleUpload, updateUser) 
  .get('/api/user/:id', authentication, getDetailUser)

module.exports = Router