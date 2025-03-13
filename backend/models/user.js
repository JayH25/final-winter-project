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
    parsedResumes: [
        {
            title: { type: String },
            date: { type: Date },
            parsedData: {
                name: { type: String },
                email: { type: String },
                phone: { type: String },
            },
        },
    ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
