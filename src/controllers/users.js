const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');

const { modelReg,
    modelCheck,
    modelUpdate,
    modelDetail,
    modelSearchUser,
    modelSearchAllUser,
    mdDeletePhoto} = require('../models/users');

const { failed,
    success,
    notFound } = require('../helpers/response');
const { query } = require('../config/mysql');

module.exports = {
    //user login
    login: (req, res) => {
        const body = req.body;
        modelCheck(body.email).then(async (response) => {
            if (response.length === 1) {
                const checkPassword = await bcrypt.compare(body.password, response[0].password);
                if (checkPassword) {
                    const userData = {
                        id: response[0].id,
                        email: response[0].email
                    };
                    const token = jwt.sign(userData, process.env.JWT_SECRET);
                    success(res, {token, id: response[0].id, email: response[0].email }, {}, 'login succesful')
                } else {
                    failed(res, "Wrong Password", {})
                }
            } else {
                failed(res, "Email hasn't been registered", {})
            }
        }).catch((err) => {
            failed(res, "Server Error", {})
            console.log(err)
        })
    },
    //user register
    userReg: (req, res) => {
        const body = req.body;
        const genUsername = body.username.split(' ').join('');
        const data = {
            email: body.email,
            password: body.password,
            username: genUsername,
            first_name: genUsername,
            image: 'default_photo.png'
        }
        modelCheck(body.email).then(async (response) => {
            if (response.length >= 1) {
                failed(res, "Email has been registered", {})
            } else {
                if (!body.email || !body.password || !body.username) {
                    failed(res, 'Empty Field, All Field Required', {})
                } else {
                    const salt = await bcrypt.genSalt();
                    const password = await bcrypt.hash(body.password, salt);
                    const user = {...data, password };
                    modelReg(user).then(async() => {
                        //register >>> halaman pin
                        // const getUser = await modelCheck(user.email)
                        // const userData = {
                        //     id : getUser[0].id,
                        //     email: getUser[0].email,
                        //     username: getUser[0].username 
                        // }
                        // const token = jwt.sign(userData, process.env.JWT_SECRET);
                        // success(res, {...userData, token}, {}, 'Register Success')

                        // register >>> halaman login
                        success(res, user, {}, 'Register Success')
                    }).catch((err) => {
                        failed(res, "Server Error", err.message)
                    });
                }
            }
        }).catch((err) => {
            failed(res, "Server Error, Check email", err.message)
        })
    },
    //update User
    updateUser: async (req, res) => {
        try {
            const body = req.body
            const currDate = moment().format('YYYY-MM-DDThh:mm:ss.ms');
            const id = req.params.id
            const detail = await modelDetail(id)
            if (req.file) {
                const data = { ...body, image: req.file.filename, updated_at: currDate };
                    if (detail[0].image === 'default_photo.png') {
                        modelUpdate(data, id)
                            .then((response) => {
                                success(res, response, {}, 'Update User success')
                            }).catch((err) => {
                                failed(res, 'Update User Failed!', err.message)
                            })
                    } else {
                        const path = `./public/images/${detail[0].image}`
                        fs.unlinkSync(path)
                        modelUpdate(data, id)
                            .then((response) => {
                                success(res, response, {}, 'Update User success')
                            }).catch(() => {
                                failed(res, 'Update user Usr Failed', err.message)
                            })
                    }
            } else {
                const data = { ...body, updated_at: currDate };
                    modelUpdate(data, id)
                    .then((response) => {
                        success(res, response, {}, 'Update User success')
                    }).catch((err) => {
                        failed(res, 'Server error', err.message)
                        console.log(err)
                    })
            }
        } catch (error) {
            failed(res, 'Error server', error.message)
            console.log(err)
        }
    },
    // //get Detail Users
    getDetailUser: (req, res) => {
        try {
            const id = req.params.id
            modelDetail(id).then((response) => {
                if (response.length > 0) {
                    success(res, response, {}, 'Get detail user success')
                } else {
                    notFound(res, "Data unavailable", response)
                }
            }).catch((err) => {
                failed(res, 'Internal server error', err.message)
            })
        } catch (error) {
            failed(res, 'Internal server error', error.message)
        }
    },
    changPassword: async(req, res) => {
        const id = req.params.id
        const detail = await modelDetail(id)
        const checkPassword = await bcrypt.compare(req.body.password, detail[0].password);
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(req.body.newPassword, salt);
        const data = {password}
        if (checkPassword) {
            modelUpdate(data, id)
            .then((response) => {
                success(res, response, {}, 'Succesfully Change Password')
            }).catch((err) => {
                failed(res, 'Server error', err.message)
                console.log(err)
            })
        } else {
            failed(res, 'Wrong Old Password', {})
        }
    },
    searchUser: async(req, res) => {
        const limit = req.query.limit? req.query.limit: '5'
        const page = req.query.page? req.query.page: '1'
        const name = req.query.name? req.query.name: '%'
        const sort = req.query.sort? req.query.sort: 'ASC'
        const offset = page === 1 ? 0 : (page - 1) * limit
        const allData = await modelSearchAllUser(name);
        modelSearchUser(name, limit, offset, sort).then((response)=>{
            if (response.length === 0){
                notFound(res, 'User not found', {})
            }
            const data = response.map((el)=>{
                return {
                    username : el.username,
                    first_name : el.first_name,
                    last_name : el.last_name,
                    image : el.image,
                    email: el.email
                }
            })
            const pagination = {
                page: page,
                totalData: allData.length,
                totalPage: Math.ceil(allData.length/limit),
                limit: limit,
            }
            success(res, data, pagination, 'Search user success')
        }).catch((err)=>{
            failed(res, 'Internal server error', err.message)
        })
    },
    deletePhoto: (req, res) => {
        try {
            modelDetail(req.params.id).then((result) => {
                if (result[0].image != 'default_photo.png') {
                    const path = `./public/images/${result[0].image}`
                    fs.unlinkSync(path)
                }
                mdDeletePhoto(req.params.id).then(() => {
                    success(res, 'Image deleted success')
                }).catch(err => {
                    failed(res, 'Internal server error', err)
                })
            }).catch((err) => {
                failed(res, 'Internal server error', err)
            })
        } catch (error) {
            failed(res, 'Internal server error', error)
        }
    }
}