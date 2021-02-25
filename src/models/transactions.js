const connection = require('../config/mysql');

module.exports = {
  mAllTrans: (user, offset, limit, sort, range, status) => {
    return new Promise((resolve, reject) => {
    let sql = `SELECT transactions.id as id, transactions.status as status, transactions.creditLeft as creditLeft, transactions.trans_id as trans_id, transactions.user_id as user_id, user.first_name as userFirstName, user.last_name as userLastName, transactions.target_id as target_id, target.first_name as targetFirstName, target.last_name AS targetLastName, target.image as targetImage, transactions.amount as amount, transactions.type as type, transactions.info as info, transactions.created_at as created_at, transactions.updated_at as updated_at FROM transactions LEFT JOIN users as user ON transactions.user_id = user.id LEFT JOIN users as target ON transactions.target_id = target.id WHERE transactions.status LIKE '%${status}%' AND (transactions.user_id LIKE '%${user}%') OR (transactions.target_id LIKE '%${user}%') AND `
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
  mDetailTrans: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT transactions.id as id, transactions.status as status, transactions.trans_id as trans_id, transactions.user_id as user_id,  user.first_name as userFirstName, user.last_name as userLastName, transactions.target_id as target_id, target.first_name as targetFirstName, target.last_name AS targetLastName, target.image as targetImage, target.handphone as targetHandphone, transactions.amount as amount, transactions.type as type, transactions.info as info, transactions.created_at as created_at, transactions.updated_at as updated_at FROM transactions LEFT JOIN users as user ON transactions.user_id = user.id LEFT JOIN users as target ON transactions.target_id = target.id WHERE transactions.id = ${id}`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mPatchTrans: (id, data) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE transactions SET ? WHERE id=?`
        connection.query(sql,[data, id], (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mTotalTrans: (user) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT  COUNT(transactions.id) as qty FROM transactions WHERE (transactions.user_id LIKE '%${user}%') OR (transactions.target_id LIKE '%${user}%')`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mTotalOut: (user) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT SUM(amount) as totalExpense FROM transactions WHERE (type='out' AND user_id LIKE '%${user}%')`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mTotalIn: (user) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT SUM(amount) as totalIncome FROM transactions WHERE (type='in' AND target_id LIKE '%${user}%') OR (type='out' AND target_id LIKE '%${user}%')`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  genId (length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `TRANS-${result}`;
  }
}