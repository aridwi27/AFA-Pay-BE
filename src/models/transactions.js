const connection = require('../config/mysql');

module.exports = {
  mAllPending: (user, offset, limit, sort, range) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT transactions.id as id, user.first_name as userFirstName, user.lastName as userLastName, target.first_name as targetFirstName, target.lastName AS targetLastName, target.image as targetImage, transactions.amount as amount, transactions.type as type, transactions.info as info, transactions.created_at as created_at FROM transactions LEFT JOIN users as user ON transactions.user_id = user.id LEFT JOIN users as target ON transactions.target_id = target.id WHERE (transactions.user_id LIKE '%${user}%') OR (transactions.target_id LIKE '%${user}%') AND`
      if (range == 'DAY' || range == 'day') {
        sql = sql + ` CAST(transactions.created_at AS DATE) = CURDATE() ORDER BY transactions.created_at ${sort} LIMIT ${offset}, ${limit}`
      } else {
        sql = sql + ` transactions.created_at BETWEEN date_sub(now(),INTERVAL 1 ${range}) and now() 
                  ORDER BY transactions.created_at ${sort} LIMIT ${offset}, ${limit}`
      }
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mAddTrans: (data) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO transactions SET ?`
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
      const sql = `DELETE FROM transactions WHERE id =${id}`
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
      const sql = `SELECT * FROM transactions WHERE id =${id}`
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