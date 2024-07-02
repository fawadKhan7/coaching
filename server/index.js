// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://fawad:fawad@cluster0.aqxoz1g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const slotRoutes = require('./routes/slots');
const userRoutes = require('./routes/users');
app.use('/api', slotRoutes);
app.use('/api', userRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
