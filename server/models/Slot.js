// server/models/Slot.js
const mongoose = require('mongoose');


const slotSchema = new mongoose.Schema({
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: Date,
    end: Date,
    done: { type: Boolean, default: false },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null }
});
module.exports = mongoose.model('Slot', slotSchema);
