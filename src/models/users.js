const connection = require('../config/mysql');

module.exports = {
    //User Register
    modelReg: (data) => {
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO users SET ?`, data, (err, result) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(result);
                }
            })
        })
    },
    //Check Email
    modelCheck: (email) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM users WHERE email='${email}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    //updateUser
    modelUpdate: (data, id) => {
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET ? WHERE id=? `, [data, id], (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    //detail User
    modelDetail: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM users WHERE id='${id}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    // Update Saldo User
    mUpdateSaldo: (data) => {
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET credit = ${data.credit} WHERE id='${data.id}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    //searchUser
    modelSearchUser: (name, limit, offset, sort) => {
        return new Promise((resolve, reject)=>{
            connection.query(`SELECT * FROM users WHERE username like '%${name}%' ORDER BY username ${sort} LIMIT ${offset}, ${limit}`, (err, result)=>{
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    modelSearchAllUser: (name) => {
        return new Promise((resolve, reject)=>{
            connection.query(`SELECT * FROM users WHERE username like '%${name}%'`, (err, result)=>{
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
}