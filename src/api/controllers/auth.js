const { logger } = require('../../index');
const Admin = require('../models/Admin');
const BlacklistedToken = require('../models/BlacklistedToken');
const bcrypt = require('bcryptjs');

module.exports.login = async (req, res) => {
    try {
        const { email, password, adminKey } = req.body;

        // Check if the admin account key exactly matches adminKey
        if(adminKey !== process.env.ADMIN_ACCOUNT_KEY) {
            logger.info(`User failed but attempted to login: ${email}`);

            return res.status(401).json({
                status: "failed",
                data: [],
                message: "The admin key you have inputted was incorrect. →_→"
            });
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email }).select('+password');

        if(!admin) {
            logger.info(`User failed but attempted to login: ${email}`);

            return res.status(400).json({
                status: "failed",
                data: [],
                message: "Invalid email or password, try again with the correct credentials."
            });
        }

        const validatePassword = await bcrypt.compare(
            password,
            admin.password
        );

        if(!validatePassword) {
            logger.info(`User failed but attempted to login: ${email}`);

            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password, try again with the correct credentials."
            });
        }

        // Generate access token & set cookie session with 'Lax' parameter
        let options = {
            maxAge: 20 * 60 * 1000, // 20 minutes
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        }

        const token = admin.generateAccessToken();
        res.cookie('SessionID', token, options);

        logger.info(`New user logged in: ${email}`);

        res.status(200).json({
            status: "success",
            data: [email],
            message: "You have successfully logged in."
        });
    } catch(e) {
        logger.error(`Error while logging in:\n${e}`);

        res.status(500).json({
            status: "error",
            data: [],
            message: "Internal Server Error"
        });
    }

    res.end();
}

module.exports.register = async (req, res) => {
    try {
        const { email, password, adminKey } = req.body;

        // Check if the admin account key exactly matches adminKey
        if(adminKey !== process.env.ADMIN_ACCOUNT_KEY) {
            logger.info(`User failed but attempted to register: ${email}`);

            return res.status(401).json({
                status: "failed",
                data: [],
                message: "The admin key you have inputted was incorrect. ←_←"
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        
        if(existingAdmin) {
            logger.info(`User failed but attempted to register: ${email}`);

            return res.status(400).json({
                status: "failed",
                data: [],
                message: "This email is taken."
            });
        }

        // Create a new admin
        await new Admin({
            email, password
        }).save();

        logger.info(`New user registered: ${email}`);

        res.status(200).json({
            status: "success",
            data: [email],
            message: "Your account has been successfully registered. You may now login."
        });
    } catch(e) {
        logger.error(`Error while registering:\n${e}`);
        
        res.status(500).json({
            status: "error",
            data: [],
            message: "Internal Server Error"
        });
    }

    res.end();
}

module.exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers['cookie'];
        if(!authHeader) return res.sendStatus(204);

        const cookie = authHeader.split('=')[1];
        const accessToken = cookie.split(';')[0];
        const isBlacklisted = await BlacklistedToken.findOne({ token: accessToken });

        if(isBlacklisted) return res.sendStatus(204);

        await new BlacklistedToken({
            token: accessToken
        }).save();

        logger.info(`New user logged out (token now blacklisted): ${accessToken}`);

        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch(e) {
        logger.error(`Error while logging out:\n${e}`);
        
        res.status.send(500).json({
            status: "error",
            data: [],
            message: "Internal Server Error"
        })
    }

    res.end();
}