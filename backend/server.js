require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db'); 
const errorMiddleware = require('./middleware/errorMiddleware');

const activityRoutes = require('./src/routes/activityRoutes');
const noteRoutes     = require('./src/routes/noteRoutes');
const stravaRoutes = require('./src/routes/stravaRoutes'); 

const app = express();
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// API
app.use('/api/activities', activityRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/strava', stravaRoutes); // <--- DODAJ

// serwowanie frontendu
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

// obsługa błędów
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
