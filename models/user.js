const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    }

});

module.exports = mongoose.model('User', userSchema);