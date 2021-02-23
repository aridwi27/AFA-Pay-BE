const express = require('express');

const { userReg,
  login,
  updateUser,
  getDetailUser,
  deletePhoto,
  getAllUsers } = require('../controller/users');

const { authentication } = require('../helper/middleware/auth')

const singleUpload = require('../helper/middleware/upload')

const Router = express.Router()

Router
  .post('/api/register', userReg) //all access
  .post('/api/login', login)  //all access
  .patch('/api/user/:id', authentication, singleUpload, updateUser) 
  .get('/api/user/:id', authentication, getAllUsers) //all access
  .get('/api/user/delete_photo/:id', authentication, deletePhoto)

module.exports = Router