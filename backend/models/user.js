const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    parsedResume: {  // Single resume object instead of an array
        name: { type: String },
        email: { type: String },
        phone: { type: String },
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
