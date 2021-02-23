const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');

const { modelReg,
    modelCheck,
    modelUpdate,
    modelDetail,
    modelSearchUser} = require('../models/users');

const { failed,
    success,
    notFound } = require('../helpers/response');

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
                    modelReg(user).then(() => {
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
                const data = { ...body, image: 'default_photo.png', updated_at: currDate };
                if (detail[0].image === 'default_photo.png') {
                    modelUpdate(data, id)
                        .then((response) => {
                            success(res, response, {}, 'Update User success')
                        }).catch((err) => {
                            failed(res, 'All textfield is required!', err.message)
                        })
                } else {
                    const path = `./public/images/${detail[0].image}`
                    fs.unlinkSync(path)
                    modelUpdate(data, id)
                        .then((response) => {
                            success(res, response, {}, 'Update User success')
                        }).catch(() => {
                            failed(res, 'Can\'t connect to database', err.message)
                        })
                }
            }
        } catch (error) {
            failed(res, 'Error server', error.message)
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
    searchUser: (req, res) => {
        modelSearchUser(req.query.name).then((response)=>{
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
            success(res, data, {}, 'Search user success')
        }).catch((err)=>{
            failed(res, 'Internal server error', err.message)
        })
    }
}