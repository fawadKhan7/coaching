// server/routes/slots.js
const express = require('express');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express.Router();

// Add a slot
// router.post('/slots', async (req, res) => {
//     const { coachId, date } = req.body;
//     const slot = new Slot({ coach: coachId, date });
//     await slot.save();
//     res.status(201).send(slot);
// });

router.post('/slots', async (req, res) => {
    const { coachId, date } = req.body;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    // Check for time conflicts
    const existingSlot = await Slot.findOne({
        coach: coachId,
        $or: [
            { date: { $lt: endDate }, end: { $gt: startDate } }
        ],
        done: false
    });
    if (existingSlot) {
        return res.status(400).send({ error: 'Time slot conflicts with an existing booking.' });
    }

    const slot = new Slot({ coach: coachId, date: startDate, end: endDate });
    await slot.save();
    res.status(201).send(slot);
});


// View upcoming slots for a coach
router.get('/slots/coach/:coachId', async (req, res) => {
    const slots = await Slot.find({ coach: req.params.coachId }).populate("coach").populate("student");
    res.send(slots);
});

// View all booked slots for a coach
router.get('/slots/coach/:coachId/booked', async (req, res) => {
    const slots = await Slot.find({ coach: req.params.coachId, student: { $ne: null }, done: false }).populate('student');
    res.send(slots);
});


// View all available slots
router.get('/slots', async (req, res) => {
    const slots = await Slot.find().populate('coach').populate('review');
    res.send(slots);
});

// Book a slot
router.post('/slots/book', async (req, res) => {
    const { slotId, studentId } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).send('Slot not found');
    if (slot.student) return res.status(400).send('Slot already booked');

    // Check if the student has already booked another slot at the same time
    const conflictingSlot = await Slot.findOne({
        student: studentId,
        date: { $lt: slot.end },
        end: { $gt: slot.date }
    });
    if (conflictingSlot) {
        return res.status(400).send('Student has already booked another slot at this time.');
    }

    slot.student = studentId;
    await slot.save();
    res.send(slot);
});

// View phone number of coach and student for a slot
router.get('/slots/:slotId', async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.slotId).populate('coach student');
        if (!slot) {
            return res.status(404).send('Slot not found');
        }

        const coachPhone = slot.coach ? slot.coach.phoneNumber : 'Not available';
        const studentPhone = slot.student ? slot.student.phoneNumber : 'Not available';

        res.send({ coachPhone, studentPhone });
    } catch (error) {
        console.error('Error fetching slot details:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Record a review by coach
router.post('/reviews', async (req, res) => {
    const { slotId, rating, notes } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).send('Slot not found');
    const review = new Review({ coach: slot.coach, student: slot.student, slot: slotId, rating, notes });
    await review.save();
    res.status(201).send(review);
});

// View past reviews for a coach
router.get('/reviews/coach/:coachId', async (req, res) => {
    const reviews = await Review.find({ coach: req.params.coachId }).populate("coach").populate("student");
    res.send(reviews);
});

// View past reviews for a student
router.get('/reviews/student/:studentId', async (req, res) => {
    const reviews = await Review.find({ student: req.params.studentId });
    res.send(reviews);
});



// Mark slot as done
router.post('/slots/done/:slotId', async (req, res) => {
    try {
        const { studentId } = req.body;
        const slot = await Slot.findById(req.params.slotId);

        if (!slot) return res.status(404).send('Slot not found');
        // if (!slot.student || slot.student.toString() !== studentId) {
        //     return res.status(403).send('Unauthorized');
        // }

        slot.done = true;
        await slot.save();

        res.send(slot);
    } catch (error) {
        console.error('Error marking slot as done:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Submit a review
router.post('/reviews/student', async (req, res) => {
    try {
        const { slotId, rating, notes, studentId } = req.body;
        const slot = await Slot.findById(slotId);
        if (!slot) return res.status(404).send('Slot not found');
        if (!slot.done || !slot.student || slot.student.toString() !== studentId) {
            return res.status(403).send('Unauthorized');
        }

        const review = new Review({ slot: slotId, student: studentId, coach: slot.coach, rating, notes, slotDate: slot.date });
        await review.save();

        // Update slot with review reference
        slot.review = review._id;
        await slot.save();

        res.status(201).send(review);
    } catch (error) {
        console.error('Error recording review:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/slots/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const slots = await Slot.find({ student: studentId }).populate('coach').populate('student').exec();
        res.json(slots);
    } catch (error) {
        console.error('Error fetching slots for student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/reviews/coach/:coachId', async (req, res) => {
    try {
        const coachId = req.params.coachId;
        const reviews = await Review.find({ 'coach': coachId })
            .populate('slot')
            .populate('student')
            .exec();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews for coach:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
