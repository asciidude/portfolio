const bcrypt = require('bcryptjs');
const { Schema, model } = require('mongoose');
const { logger } = require('../../index');
const jwt = require('jsonwebtoken');

const AdminSchema = new Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Hash passwords before saving to database
AdminSchema.pre('save', function(next) {
    if(!this.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if(err) {
            logger.error(`Error while generating salt for ${user.email}:\n${err}`, false);
            return next(err);
        }

        bcrypt.hash(this.password, salt, (err, hash) => {
            if(err) {
                logger.error(`Error while generating hash for ${user.email}:\n${err}`, false);
                return next(err);
            }

            this.password = hash;
            next();
        });
    });
});

// Generate access token
AdminSchema.methods.generateAccessToken = function() {
    let payload = {
        id: this._id
    };

    return jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: '20m'
    });
}

module.exports = model('Admin', AdminSchema);