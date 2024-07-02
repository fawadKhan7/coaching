const express = require('express');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Review = require('../models/Review');
const router = express.Router();


router.get('/seed-users', async (req, res) => {
    await User.deleteMany({});
    const users = [
        { name: 'Coach1', role: 'coach', phoneNumber: '123-456-7890', image: "https://xsgames.co/randomusers/avatar.php?g=male" },
        { name: 'Coach2', role: 'coach', phoneNumber: '234-567-8901', image: "https://xsgames.co/randomusers/avatar.php?g=male" },
        { name: 'Student1', role: 'student', phoneNumber: '345-678-9012', image: "https://xsgames.co/randomusers/avatar.php?g=male" },
        { name: 'Student2', role: 'student', phoneNumber: '456-789-0123', image: "https://xsgames.co/randomusers/avatar.php?g=male" },
    ];

    await User.insertMany(users);
    res.send('Users seeded successfully');
});

router.get('/students', async (req, res) => {
    const slots = await User.find({ role: "student" });
    res.send(slots);
});

router.get('/coaches', async (req, res) => {
    const slots = await User.find({ role: "coach" });
    res.send(slots);
});

module.exports = router;
