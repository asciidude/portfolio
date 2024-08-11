const express = require('express');
const { register, login, logout } = require('../controllers/auth');
const validate = require('../middleware/validate');
const { check } = require('express-validator');
const { logger } = require('../../index');
const axios = require('axios');

let commonPasswords = [];

const router = express.Router();

router.use((req, res, next) => {
    const { method, url } = req;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.info(`${method} ${url} by ${ip}`);
    next();
});

router.post(
    '/register',
    check('email')
        .isEmail()
        .withMessage('Enter a valid email address')
        .normalizeEmail(),
    check('password')
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage('Your password must be a minimum of 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Your password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Your password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Your password must contain at least one number')
        .matches(/[\W_]/)
        .withMessage('Your password must contain at least one special character')
        .custom(value => !commonPasswords.includes(value))
        .withMessage('Password is too common'),
    validate,
    register
)

router.post(
    '/login',
    check('email')
        .isEmail()
        .withMessage('Enter a valid email address')
        .normalizeEmail(),
    check('password')
        .not()
        .isEmpty(),
    validate,
    login
)

router.get(
    '/logout',
    logout
)

module.exports = router;