const { mAddTrans, mDeleteTrans, mDetailTrans } = require('../models/pending')
const { mUpdateSaldo, modelDetail } = require('../models/users')
const { failed, success, notFound } = require('../helpers/response');

module.exports ={
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
            // Jika ada penambahan saldo
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

  }
}