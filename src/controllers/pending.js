const { mAddTrans, mDeleteTrans, mDetailTrans, mAllPending } = require('../models/pending')
const { mUpdateSaldo, modelDetail } = require('../models/users')
const { failed, success, notFound } = require('../helpers/response');

module.exports ={
  allTrans: (req, res) => {
    try {
      const limit = req.query.limit ? req.query.limit : '5'
      const sort = req.query.sort ? req.query.sort : 'desc'
      const range = req.query.range ? toUpper(req.query.range) : 'YEAR'
      const page = req.query.page ? req.query.page : '1'
      const offset = page === 1 ? 0 : (page - 1) * limit
      const user = req.query.user ? req.query.user : '%'
      mAllPending(user, offset, limit, sort, range)
        .then((dataPending) => {
          success(res, dataPending, {}, 'Display Pending Data Success')
        })
        .catch((err) => {
          failed(res, '', err.message, 'Query Problem')
        })
    } catch (err){
      failed(res, '', err.message, 'Internal Server Error')
    }
  },
  addTrans: (req, res) => {
      try {
          // Ambil data dari body
          const data = req.body
          // Inisialisasi Checker
          if(data.user_id && data.target_id && data.amount && data.info && data.type){
            const finalData = {
              user_id: data.user_id,
              target_id: data.target_id,
              amount: data.amount,
              info: data.info,
              type: data.type,
              status: 'Pending'
            }
                // Ambil detailnya User
                modelDetail(data.user_id)
                  .then(async (resDetailUser) => {
                    let dataUpdateUser = {}
                    if (data.type === 'in') {
                      dataUpdateUser = {
                        id: data.user_id,
                        // Kalau misalkan mau langsung Tambah saldo
                        credit: Number(resDetailUser[0].credit) + Number(data.amount)
                        // credit: Number(resDetailUser[0].credit)
                      }
                    } else {
                      dataUpdateUser = {
                        id: data.user_id,
                        credit: Number(resDetailUser[0].credit) - Number(data.amount)
                      }
                    }
                    await mUpdateSaldo(dataUpdateUser)
                      .then(async () => {
                        // Tambahkan ke tabel transaksi
                        await mAddTrans(finalData)
                          .then(() => {
                            // Kalau Transaksi Sukses
                            success(res, 'Transaction Success', {}, '')
                          })
                          // Kalau Gagal Transaksi menambahkan
                          .catch((err) => {
                            failed(res, 'Transaction Failed', err.message)
                          })
                      })
                      .catch((err) => {
                        // Kalau ada tipe data yang salah
                        failed(res, 'Transaction Failed, Wrong Data Type', err.message)
                      })
                  })
                  .catch((err) => {
                    failed(res, 'Transaction Failed, Something happened', err.message)
                  })
          } else {
              // Kalau ada data yang kosong
              failed(res, 'Transaction Failed, Empty Field Found', err.message)
          }
      } catch (err) {
          // Kalau ada salah lainnya
          failed(res, 'Internal Server Error', err.message)
    }
  },
  detailTrans: (req, res) => {
    try {
      // Ambil data dari parameter
      const id = req.params.id
      mDetailTrans(id)
        .then((response) => {
          if (response.length != 0) {
            // Kalau ada datanya
            success(res, response, {}, 'Display Success')
          } else {
            // kalau tidak ada datanya
            failed(res, 'Data Not Found, Wrong ID Detected', {})
          }
        })
        .catch((err) => {
          // Kalau salah parameternya
          failed(res, 'Wrong Parameter Type', {})
        })
    } catch (err) {
      // Kalau ada salah lainnya
      failed(res, 'Internal Server Error', {})
    }
  },
  deleteTrans: (req, res) => {
    try {
        const id = req.params.id
        mDetailTrans (id)
          .then(async (resDetailTrans) => {
            await modelDetail(resDetailTrans[0].user_id)
            .then(async (resDetailUser) => {
                  let dataUpdateUser = {}
                  if (resDetailTrans[0].type === 'in') {
                    dataUpdateUser = {
                      id: resDetailTrans[0].user_id,
                      // Kalau misalkan mau langsung Tambah saldo
                      credit: Number(resDetailUser[0].credit) - Number(resDetailTrans[0].amount)
                      // credit: Number(resDetailUser[0].credit)
                    }
                  } else {
                    dataUpdateUser = {
                      id: resDetailTrans[0].user_id,
                      credit: Number(resDetailUser[0].credit) + Number(resDetailTrans[0].amount)
                    }
                  }
                  await mUpdateSaldo(dataUpdateUser)
                    .then(async () => {
                      // Tambahkan ke tabel transaksi
                      await mDeleteTrans(id)
                        .then(() => {
                          // Kalau Transaksi Sukses
                          success(res, 'Transaction Success', {}, '')
                        })
                        // Kalau Gagal Transaksi menambahkan
                        .catch((err) => {
                          failed(res, 'Transaction Failed', err.message)
                        })
                    })
                    .catch((err) => {
                      // Kalau ada tipe data yang salah
                      failed(res, 'Transaction Failed, Wrong Data Type', err.message)
                    })
                })
                .catch((err) => {
                  failed(res, 'Transaction Failed, Something happened', err.message)
                })
          })
          .catch((err) => {
            failed(res, 'Transaction Failed, Something happened', err.message)
          })
      } catch (err) {
        // Kalau ada salah lainnya
        failed(res, 'Internal Server Error', err.message)
    }
  }
}