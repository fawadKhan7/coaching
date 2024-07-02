const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    role: { type: String, enum: ['student', 'coach'] },
    phoneNumber: String,
    image: String
});

module.exports = mongoose.model('User', userSchema);