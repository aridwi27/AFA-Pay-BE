const { mAddTrans, mAllTrans, mTotalTrans, mDetailTrans, mTotalIn, mTotalOut} = require('../models/transactions')
const { mDetailPending, mDeletePending } = require('../models/pending')
const { mUpdateSaldo, modelDetail } = require('../models/users')
const { failed, success, notFound } = require('../helpers/response');

module.exports ={
  allTrans: async (req, res) => {
    try {
      const limit = req.query.limit ? req.query.limit : '5'
      const sort = req.query.sort ? req.query.sort : 'desc'
      const range = req.query.range ? toUpper(req.query.range) : 'YEAR'
      const page = req.query.page ? req.query.page : '1'
      const offset = page === 1 ? 0 : (page - 1) * limit
      const user = req.query.id ? Number(req.query.id) : '%'
      const totalTrans = await mTotalTrans(user)
      const totalIncome = await mTotalIn(user)
      const totalExpense = await mTotalOut(user)
      mAllTrans(user, offset, limit, sort, range)
        .then((dataTrans) => {
          const paginationTrans = {
              // Halaman yang sedang diakses
              page,
              // Batasan Banyaknya hasil per halaman
              limit,
              // range data yang sedang ditampilkan
              range,
              // Banyaknya Invoices yang terdaftar
              totalData: totalTrans[0].qty,
              // Banyaknya Pemasukan
              totalIncome: totalIncome[0].totalIncome,
              // Banyaknya Pengeluaran
              totalExpense: totalExpense[0].totalExpense,
              // TotalPages
              totalPages: Math.ceil(totalTrans[0].qty/limit)
          }
          if(dataTrans.length > 0) {
            // res, data, pagination, message
            success(res, dataTrans, paginationTrans, 'Display Transactions Data Success')
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
  confirmTrans: (req, res) => {
      try {
          // Ambil data dari body
          const id = req.params.id
          // Inisialisasi Checker
                mDetailPending(id)
                  .then(async (resDetailPending) => {
                    await modelDetail(resDetailPending[0].target_id)
                      .then(async (resDetailUser) => {
                        console.log(resDetailUser[0])
                        let dataUpdateUser = {}
                        if (resDetailPending[0].type === 'out') {
                          dataUpdateUser = {
                            id: resDetailPending[0].target_id,
                            // Kalau misalkan mau langsung Tambah saldo
                            credit: Number(resDetailUser[0].credit) + Number(resDetailPending[0].amount)
                          }
                        } else {
                          dataUpdateUser = {
                            id: resDetailPending[0].target_id,
                            credit: Number(resDetailUser[0].credit) - Number(resDetailPending[0].amount)
                          }
                        }
                        await mUpdateSaldo(dataUpdateUser)
                          .then(async () => {
                            const finalData = {
                              trans_id: resDetailPending[0].trans_id,
                              user_id: resDetailPending[0].user_id,
                              target_id: resDetailPending[0].target_id,
                              amount: resDetailPending[0].amount,
                              type: resDetailPending[0].type,
                              info: resDetailPending[0].info,
                              created_at: resDetailPending[0].created_at,
                              status: 'Success',
                            }
                            // Tambahkan ke tabel transaksi
                            await mAddTrans(finalData)
                              .then(async () => {
                                // Kalau Transaksi Sukses
                                await mDeletePending(id)
                                .then((responseAkhir) => {
                                  if(responseAkhir.affectedRows >= 1) {
                                    success(res, 'Transaction Success', {}, 'Transaction Confirmed')
                                  } else {
                                    failed(res,'Data Already Deleted',{})
                                  }
                                })
                                .catch((err) => {
                                  failed(res, 'Transaction Failed', err.message)
                                })
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
                        failed(res, 'Transaction Failed, Wrong Data Type', err.message)
                      })
                  })
                  .catch((err) => {
                    failed(res, 'Transaction Failed, Something happened', err.message)
                  })
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
}