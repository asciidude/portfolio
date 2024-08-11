const Admin = require('../models/Admin');
const BlacklistedToken = require('../models/BlacklistedToken');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['cookie'];
        if(!authHeader) return next();

        const cookie = authHeader.split('=')[1];
        const accessToken = cookie.split(';')[0];
        const isBlacklisted = await BlacklistedToken.findOne({ token: accessToken });

        if(isBlacklisted) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Your authorization token has been blacklisted, please re-login."
            })
        }

        jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN, async(err, decoded) => {
            if(err) {
                return res.status(401).json({
                    status: "failed",
                    data: [],
                    message: "This session has expired or been tampered with, please re-login."
                });
            }

            const { id } = decoded;
            const data = await Admin.findById(id);
            const { password, ...adminData } = data._doc;
            req.admin = adminData;

            next();
        });
    } catch(e) {
        return res.status(500).json({
            status: "error",
            data: [],
            message: "Internal Server Error"
        });
    }
};