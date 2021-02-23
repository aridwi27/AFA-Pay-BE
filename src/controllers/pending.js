const { mAddPending, mDeletePending, mDetailPending, mAllPending, mTotalPending, genId } = require('../models/pending')
const { mUpdateSaldo, modelDetail } = require('../models/users')
const { failed, success, notFound } = require('../helpers/response');
const { mAddTrans } = require('../models/transactions');

module.exports ={
  allPending: async (req, res) => {
    try {
      const limit = req.query.limit ? req.query.limit : '5'
      const sort = req.query.sort ? req.query.sort : 'desc'
      const range = req.query.range ? toUpper(req.query.range) : 'YEAR'
      const page = req.query.page ? req.query.page : '1'
      const offset = page === 1 ? 0 : (page - 1) * limit
      const user = req.query.id ? Number(req.query.id) : '%'
      const totalPending = await mTotalPending(user)
      mAllPending(user, offset, limit, sort, range)
        .then((dataPending) => {
          const paginationPending = {
              // Halaman yang sedang diakses
              page,
              // Batasan Banyaknya hasil per halaman
              limit,
              // range data yang sedang ditampilkan
              range,
              // Banyaknya Invoices yang terdaftar
              totalData: totalPending[0].qty,
              // TotalPages
              totalPages: Math.ceil(totalPending[0].qty/limit)
          }
          if(dataPending.length >= 1) {
            // res, data, pagination, message
            success(res, dataPending, paginationPending, 'Display Pending Data Success')
          } else {
            success(res, {}, {}, 'No Data Found')
          }
        })
        .catch((err) => {
          failed(res, 'Query Probblem', err.message)
        })
    } catch (err){
      failed(res, 'Internal Server Error', err.message)
    }
  },
  addPending: async (req, res) => {
      try {
          // Ambil data dari body
          const data = req.body
          // Inisialisasi Checker
          if(data.user_id && data.target_id && data.amount && data.info && data.type){
                // Ambil detailnya User
                modelDetail(data.user_id)
                  .then(async (resDetailUser) => {
                    let dataUpdateUser = {}
                    if (Number(resDetailUser[0].credit) >= Number(data.amount)) {
                      if (data.type === 'in') {
                        const finalData = {
                          trans_id: await genId(10),
                          user_id: data.user_id,
                          target_id: data.target_id,
                          amount: data.amount,
                          info: data.info,
                          type: data.type,
                          status: 'Success',
                        }
                        dataUpdateUser = {
                          id: data.user_id,
                          // Kalau misalkan mau langsung Tambah saldo
                          credit: Number(resDetailUser[0].credit) + Number(data.amount)
                          // credit: Number(resDetailUser[0].credit)
                        }
                        await mUpdateSaldo(dataUpdateUser)
                        .then(async () => {
                          // Tambahkan ke tabel transaksi
                          await mAddTrans(finalData)
                            .then(() => {
                              // Kalau Transaksi Sukses
                              success(res, {}, {}, 'Transaction Success')
                            })
                            // Kalau Gagal Transaksi menambahkan
                            .catch((err) => {
                              failed(res, 'Transaction Failed', err.message)
                            })
                        })
                        .catch((err) => {
                          // Kalau ada tipe data yang salah
                          failed(res, 'Wrong Data Type', err.message)
                        })
                      } else {
                        const finalData = {
                          trans_id: await genId(10),
                          user_id: data.user_id,
                          target_id: data.target_id,
                          amount: data.amount,
                          info: data.info,
                          type: data.type
                        }
                        dataUpdateUser = {
                          id: data.user_id,
                          credit: Number(resDetailUser[0].credit) - Number(data.amount)
                        }
                        await mUpdateSaldo(dataUpdateUser)
                        .then(async () => {
                          // Tambahkan ke tabel transaksi
                          await mAddPending(finalData)
                            .then(() => {
                              // Kalau Transaksi Sukses
                              success(res, {}, {}, 'Transaction Success')
                            })
                            // Kalau Gagal Transaksi menambahkan
                            .catch((err) => {
                              failed(res, 'Transaction Failed', err.message)
                            })
                        })
                        .catch((err) => {
                          // Kalau ada tipe data yang salah
                          failed(res, 'Wrong Data Type', err.message)
                        })
                      }
                    } else {
                      failed(res, 'Credit Minus', 'Your Balance is too low')
                    }
                  })
                  .catch((err) => {
                    failed(res, 'Internal Server Error', err.message)
                  })
          } else {
              // Kalau ada data yang kosong
              failed(res, 'Empty Field Found', err.message)
          }
      } catch (err) {
          // Kalau ada salah lainnya
          failed(res, 'Internal Server Error', err.message)
    }
  },
  detailPending: (req, res) => {
    try {
      // Ambil data dari parameter
      const id = req.params.id
      mDetailPending(id)
        .then((response) => {
          if (response.length != 0) {
            // Kalau ada datanya
            success(res, response, {}, 'Display Transaction Success')
          } else {
            // kalau tidak ada datanya
            failed(res, 'Data not Found', {})
          }
        })
        .catch((err) => {
          // Kalau salah parameternya
          failed(res, 'Wrong Parameter Type', err.message)
        })
    } catch (err) {
      // Kalau ada salah lainnya
      failed(res, 'Internal Server Error', err.message)
    }
  },
  deletePending: (req, res) => {
    try {
        const id = req.params.id
        mDetailPending (id)
          .then(async (resDetailPending) => {
            await modelDetail(resDetailPending[0].user_id)
            .then(async (resDetailUser) => {
                  let dataUpdateUser = {}
                  if (resDetailPending[0].type === 'in') {
                    dataUpdateUser = {
                      id: resDetailPending[0].user_id,
                      // Kalau misalkan mau langsung Tambah saldo
                      credit: Number(resDetailUser[0].credit) - Number(resDetailPending[0].amount)
                      // credit: Number(resDetailUser[0].credit)
                    }
                  } else {
                    dataUpdateUser = {
                      id: resDetailPending[0].user_id,
                      credit: Number(resDetailUser[0].credit) + Number(resDetailPending[0].amount)
                    }
                  }
                  await mUpdateSaldo(dataUpdateUser)
                    .then(async () => {
                      // Tambahkan ke tabel transaksi
                      await mDeletePending(id)
                        .then(() => {
                          // Kalau Transaksi Sukses
                          success(res, {}, {}, 'Delete Transaction Success')
                        })
                        // Kalau Gagal Transaksi menambahkan
                        .catch((err) => {
                          failed(res, 'Delete transaction Failed', err.message)
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