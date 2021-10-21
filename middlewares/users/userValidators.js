// external imports
const { check, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const path = require('path');
const { unlink } = require('fs');

// internal imports
const User = require('../../models/People');

// add user

const addUserValidators = [
    // Check Name
    check('name')
        .isLength({ min: 1 })
        .withMessage('Name is required')
        .isAlpha('en-US', { ignore: ' -' })
        .withMessage('Name must not containe anything other than alphabet')
        .trim(),
    // Check email
    check('email')
        .isEmail()
        .withMessage('Invalid email address')
        // custom check from database
        .custom(async (value) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw createHttpError('Email already is use');
                }
            } catch (err) {
                throw createHttpError(err.message);
            }
        }),
    // Check Mobile
    check('mobile')
        .isMobilePhone('bn-BD', {
            strictMode: true,
        })
        .withMessage('Mobile number must be a valid Bangladeshi mobile number')
        // custom check from database
        .custom(async (value) => {
            try {
                const user = await User.findOne({ mobile: value });
                if (user) {
                    throw createHttpError('Mobile already is use');
                }
            } catch (err) {
                throw createHttpError(err.message);
            }
        }),
    // Check Password
    check('password')
        .isStrongPassword()
        .withMessage(
            'Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 Symbol'
        ),
];

const addUserValidationHandler = function (req, res, next) {
    const errors = validationResult(req);
    const mapperError = errors.mapped();
    if (Object.keys(mapperError).length === 0) {
        next();
    } else {
        // remove upload files
        if (req.files.length > 0) {
            const { filename } = req.files[0];
            unlink(
                path.join(__dirname, `/../public/uploads/avatars/${filename}`),
                (err) => {
                    if (err) {
                        if (err) console.log(err);
                    }
                }
            );
        }
        res.status(500).json({
            errors: mapperError,
        });
    }
};

module.exports = {
    addUserValidators,
    addUserValidationHandler,
};
