const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true},
    firstName: { type: String},
    lastName: { type: String},
    password: { type: String},
    avatar: { type: String},
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
