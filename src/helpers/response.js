module.exports = {
    success: (res, data, pagination, message) => {
        const response = {
            code: 200,
            message,
            pagination,
            data
        }
        res.status(200).json(response)
    },
    notFound: (res, message, data) => {
        const response = {
            code: 404,
            message,
            data
        }
        res.status(404).json(response)
    },
    failed: (res, message, data) => {
        const response = {
            code: 500,
            message,
            data
        }
        // res.json(response)
        res.status(500).json(response)
    }
}