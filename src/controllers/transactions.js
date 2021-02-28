const {
  mAddTrans,
  mAllTrans,
  mTotalTrans,
  mDetailTrans,
  mTotalIn,
  mTotalOut,
  genId,
  mPatchTrans
} = require('../models/transactions')
const {
  mUpdateSaldo,
  modelDetail
} = require('../models/users')
const {
  failed,
  success,
  notFound
} = require('../helpers/response');
const moment = require('moment');

module.exports = {
  allTrans: async (req, res) => {
    try {
      const limit = req.query.limit ? req.query.limit : '5'
      const sort = req.query.sort ? req.query.sort : 'desc'
      const range = req.query.range ? (req.query.range).toUpperCase() : 'YEAR'
      const page = req.query.page ? req.query.page : '1'
      const offset = page === 1 ? 0 : (page - 1) * limit
      const user = req.query.id ? Number(req.query.id) : '%'
      const status = req.query.status ? req.query.status : '%'
      const order = req.query.order ? req.query.order : 'created_at'
      const totalTrans = await mTotalTrans(user, range, status)
      const totalIncome = await mTotalIn(user)
      const totalExpense = await mTotalOut(user)
      mAllTrans(user, offset, limit, sort, range, status, order)
        .then((dataTrans) => {
          const paginationTrans = {
            // Halaman yang sedang diakses
            page,
            // Batasan Banyaknya hasil per halaman
            limit,
            // range data yang sedang ditampilkan
            range,
            // Banyaknya Invoices yang terdaftar
            totalData: totalTrans[0].total,
            // Banyaknya Pemasukan
            totalIncome: totalIncome[0].totalIncome,
            // Banyaknya Pengeluaran
            totalExpense: totalExpense[0].totalExpense,
            // TotalPages
            totalPages: Math.ceil(totalTrans[0].total / limit)
          }
          if (dataTrans.length > 0) {
            // res, data, pagination, message
            success(res, dataTrans, paginationTrans, 'Display Transactions Data Success')
          } else {
            success(res, {}, {}, 'No Data Found')
          }
        })
        .catch((err) => {
          failed(res, 'Query Probblem', err.message)
        })
    } catch (err) {
      failed(res, 'Internal Server Error', err.message)
    }
  },
  confTrans: (req, res) => {
    try {
      const currDate = moment().format('YYYY-MM-DDThh:mm:ss.ms');
      // Ambil data dari body
      const id = req.params.id
      const status = req.body.status
      if (status) {
        mDetailTrans(id)
          .then(async (resDetailTrans) => {
            if (resDetailTrans.length > 0) {
              if (resDetailTrans[0].status === 'Pending') {
                if (status === 'canceled' || status === 'Canceled') {
                  await modelDetail(resDetailTrans[0].user_id)
                    .then(async (resDetailUser) => {
                      let dataUpdateUser = {
                        id: resDetailTrans[0].user_id,
                        // Kalau misalkan mau langsung Tambah saldo
                        credit: Number(resDetailUser[0].credit) + Number(resDetailTrans[0].amount),
                        updated_at: currDate
                      }
                      await mUpdateSaldo(dataUpdateUser)
                        .then(async () => {
                          const finalData = {
                            updated_at: currDate,
                            status: 'Canceled'
                          }
                          // Tambahkan ke tabel transaksi
                          await mPatchTrans(id, finalData)
                            .then(() => {
                              success(res, 'Transaction Success', {}, 'Transaction Canceled')
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
                      failed(res, 'User Not Found', err.message)
                    })
                } else {
                  await modelDetail(resDetailTrans[0].target_id)
                    .then(async (resDetailUser) => {
                      let dataUpdateUser = {
                        id: resDetailTrans[0].target_id,
                        // Kalau misalkan mau transfer
                        credit: Number(resDetailUser[0].credit) + Number(resDetailTrans[0].amount),
                        updated_at: currDate
                      }
                      await mUpdateSaldo(dataUpdateUser)
                        .then(async () => {
                          const currDate = moment().format('YYYY-MM-DDThh:mm:ss.ms');
                          const finalData = {
                            updated_at: currDate,
                            status: 'Success',
                          }
                          // Tambahkan ke tabel transaksi
                          await mPatchTrans(id, finalData)
                            .then(() => {
                              success(res, 'Transaction Success', {}, 'Transaction Confirmed')
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
                      failed(res, 'User Not Found', err.message)
                    })
                }
              } else {
                failed(res, 'Transaction Already Done', '')
              }
            } else {
              failed(res, 'Transaction Not Found', '')
            }
          })
      } else {
        failed(res, 'Status Required', '')
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
            success(res, response, {}, 'Display Transaction Detail Success')
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
  addTrans: async (req, res) => {
    try {
      const currDate = moment().format('YYYY-MM-DDThh:mm:ss.ms');
      // Ambil data dari body
      const data = req.body
      // Inisialisasi Checker
      if (data.user_id && data.target_id && data.amount && data.info && data.type) {
        // Ambil detailnya User
        modelDetail(data.user_id)
          .then(async (resDetailUser) => {
            let dataUpdateUser = {}
            console.log(resDetailUser[0].credit >= data.amount)
            if (data.type === 'in') {
              const finalData = {
                trans_id: await genId(10),
                user_id: data.user_id,
                target_id: data.target_id,
                amount: data.amount,
                info: data.info,
                type: data.type,
                status: 'Success',
                creditLeft: Number(Number(resDetailUser[0].credit) + Number(data.amount))
              }
              dataUpdateUser = {
                id: data.user_id,
                // Kalau misalkan mau langsung Tambah saldo
                credit: Number(Number(resDetailUser[0].credit) + Number(data.amount)),
                // credit: Number(resDetailUser[0].credit)
              }
              await mUpdateSaldo(dataUpdateUser)
                .then(async () => {
                  // Tambahkan ke tabel transaksi
                  await mAddTrans(finalData)
                    .then((note) => {
                      const dataAkhir = {
                        id: note.insertId,
                        trans_id: finalData.trans_id,
                        type: finalData.type,
                        info: finalData.info,
                        amount: Number(data.amount),
                        currentCredit: dataUpdateUser.credit,
                        status: finalData.status
                      }
                      // Kalau Transaksi Sukses
                      success(res, dataAkhir, {}, 'Top Up Success')
                    })
                    // Kalau Gagal Transaksi menambahkan
                    .catch((err) => {
                      failed(res, 'Top Up Failed', err.message)
                    })
                })
                .catch((err) => {
                  // Kalau ada tipe data yang salah
                  failed(res, 'Wrong Data Type', err.message)
                })
            } else {
              if (Number(resDetailUser[0].credit) >= Number(data.amount)) {
                const finalData = {
                  trans_id: await genId(10),
                  user_id: data.user_id,
                  target_id: data.target_id,
                  amount: data.amount,
                  info: data.info,
                  type: data.type,
                  status: 'Pending',
                  creditLeft: Number(Number(resDetailUser[0].credit) - Number(data.amount))
                }
                dataUpdateUser = {
                  id: data.user_id,
                  // Kalau misalkan mau langsung Tambah saldo
                  credit: Number(Number(resDetailUser[0].credit) - Number(data.amount)),
                  // credit: Number(resDetailUser[0].credit)
                }
                await mUpdateSaldo(dataUpdateUser)
                  .then(async () => {
                    // Tambahkan ke tabel transaksi
                    console.log(finalData)
                    await mAddTrans(finalData)
                      .then((note) => {
                        // Kalau Transaksi Sukses
                        const data = {
                          id: note.insertId,
                          trans_id: finalData.trans_id,
                          type: finalData.type,
                          to: finalData.target_id,
                          amount: finalData.amount,
                          currentCredit: resDetailUser[0].credit - finalData.amount,
                          status: finalData.status,
                          info: finalData.info,
                        }
                        success(res, data, {}, 'Transfer Success, Please Wait for Confirmation')
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
                failed(res, 'Credit Minus', 'Your Balance is too low')
              }
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
}