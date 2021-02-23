const jwt = require('jsonwebtoken');
const { failed } = require('../response')
module.exports = {
    authentication: (req, res, next) => {
        const header = req.headers;
        if (!header.token) {
            failed(res, 'Login required', {})
        } else {
            jwt.verify(header.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    failed(res, 'Invalid token', err)
                } else {
                    next()
                }
            })
        }
    },
}