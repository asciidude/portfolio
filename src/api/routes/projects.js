const express = require('express');
const validate = require('../middleware/validate');
const verify = require('../middleware/verify');
const { logger } = require('../../index');
const { check } = require('express-validator');
const { addProject, removeProject, editProject } = require('../controllers/projects');

const router = express.Router();

router.use((req, res, next) => {
    const { method, url } = req;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.info(`${method} ${url} by ${ip}`);
    next();
});

router.post(
    '/add',
    check('name')
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage('The project name must be at least 3 characters long'),
    check('description')
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage('The description must be at least 10 characters long.'),
    check('link')
        .notEmpty()
        .withMessage('Link must not be empty'),
    check('status')
        .notEmpty()
        .isIn(['active', 'inactive', 'archive'])
        .withMessage('Status must be "active", "inactive", or "archive"'),
    validate,
    verify,
    addProject
)

router.post(
    '/edit/:id',
    check('name')
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage('The project name must be at least 3 characters long'),
    check('description')
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage('The description must be at least 10 characters long.'),
    check('link')
        .notEmpty()
        .withMessage('Link must not be empty'),
    check('status')
        .notEmpty()
        .isIn(['active', 'inactive', 'archive'])
        .withMessage('Status must be "active", "inactive", or "archive"'),
    validate,
    verify,
    editProject
)

router.post(
    '/delete/:id',
    validate,
    removeProject
)

module.exports = router;