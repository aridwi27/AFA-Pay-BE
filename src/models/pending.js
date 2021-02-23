const connection = require('../config/mysql');

module.exports = {
  mAllPending: (user, offset, limit, sort, range) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT pendings.id as id, user.first_name as userFirstName, user.lastName as userLastName, target.first_name as targetFirstName, target.lastName AS targetLastName ,pendings.amount as amount, pendings.type as type, pendings.info as info, pendings.created_at as created_at FROM pendings LEFT JOIN users as user ON pendings.user_id = user.id LEFT JOIN users as target ON pendings.target_id = target.id WHERE pendings.user_id LIKE '%${user}%' AND`
      if (range == 'DAY' || range == 'day') {
        sql = sql + ` CAST(pendings.created_at AS DATE) = CURDATE() ORDER BY pendings.created_at ${sort} LIMIT ${offset}, ${limit}`
      } else {
        sql = sql + ` pendings.created_at BETWEEN date_sub(now(),INTERVAL 1 ${range}) and now() 
                  ORDER BY pendings.created_at ${sort} LIMIT ${offset}, ${limit}`
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