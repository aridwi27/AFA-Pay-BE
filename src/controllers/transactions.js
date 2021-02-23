const { mAddTrans, mDeleteTrans } = require('../models/transactions')
const { mDetailPending, mDeletePending } = require('../models/pending')
const { mUpdateSaldo, modelDetail } = require('../models/users')
const { failed, success, notFound } = require('../helpers/response');

module.exports ={
  // allTrans: (req, res) => {
  //   try {
  //     const limit = req.query.limit ? req.query.limit : '5'
  //     const sort = req.query.sort ? req.query.sort : 'desc'
  //     const range = req.query.range ? toUpper(req.query.range) : 'YEAR'
  //     const page = req.query.page ? req.query.page : '1'
  //     const offset = page === 1 ? 0 : (page - 1) * limit
  //     const user = req.query.user ? req.query.user : '%'
  //     mAllPending(user, offset, limit, sort, range)
  //       .then((dataPending) => {
  //         success(res, dataPending, {}, 'Display Pending Data Success')
  //       })
  //       .catch((err) => {
  //         failed(res, '', err.message, 'Query Problem')
  //       })
  //   } catch (err){
  //     failed(res, '', err.message, 'Internal Server Error')
  //   }
  // },
  confirmTrans: (req, res) => {
      try {
          // Ambil data dari body
          const id = req.params.id
          // Inisialisasi Checker
                mDetailPending(id)
                  .then(async (resDetailPending) => {
                    await modelDetail(resDetailPending[0].target_id)
                      .then(async (resDetailUser) => {
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
                                    failed(res, '', 'Data Already Deleted')
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
  }
}