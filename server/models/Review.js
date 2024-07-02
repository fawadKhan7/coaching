const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }, // 'Slot' should match the model name
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 'User' should match the model name
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 'User' should match the model name
    rating: { type: Number, required: true, min: 1, max: 5 },
    notes: { type: String, required: true },
    slotDate: { type: Date }
});
module.exports = mongoose.model('Review', reviewSchema);