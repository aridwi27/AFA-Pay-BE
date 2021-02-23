const connection = require('../config/mysql');

module.exports = {
  mAllPending: (user, offset, limit, sort, range) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT pendings.id as id,  pendings.trans_id as trans_id, user.first_name as userFirstName,user.last_name as userLastName, target.first_name as targetFirstName, target.last_name AS targetLastName, target.image as targetImage, pendings.amount as amount, pendings.type as type, pendings.info as info, pendings.created_at as created_at FROM pendings LEFT JOIN users as user ON pendings.user_id = user.id LEFT JOIN users as target ON pendings.target_id = target.id WHERE (pendings.user_id LIKE '%${user}%') OR (pendings.target_id LIKE '%${user}%') AND`
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
  mAddPending: (data) => {
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
  mDeletePending: (id) => {
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
  mDetailPending: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT pendings.id as id,  pendings.trans_id as trans_id, pendings.user_id as user_id, user.first_name as userFirstName,user.last_name as userLastName, pendings.target_id as target_id,  target.first_name as targetFirstName, target.last_name AS targetLastName, target.image as targetImage, pendings.amount as amount, pendings.type as type, pendings.info as info, pendings.created_at as created_at FROM pendings LEFT JOIN users as user ON pendings.user_id = user.id LEFT JOIN users as target ON pendings.target_id = target.id WHERE pendings.id = ${id}`
        connection.query(sql, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        })
    })
  },
  mTotalPending: (user) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(pendings.id) as qty FROM pendings WHERE (pendings.user_id LIKE '%${user}%') OR (pendings.target_id LIKE '%${user}%')`
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