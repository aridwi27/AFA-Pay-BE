const connection = require('../config/mysql');

module.exports = {
  mAddTrans: (data) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO pendings SET ?`
        connection.query(sql, data, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mDeleteTrans: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM pendings WHERE id =${id}`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mDetailTrans: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM pendings WHERE id =${id}`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  }
}