const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type:     { type: String, required: true }, // 'run' | 'workout' | 'other'
  name:     { type: String, required: true },
  date:     { type: Date,   required: true },
  duration: { type: Number, default: null },   // minuty
  distance: { type: Number, default: null },   // km
  notes:    { type: String, default: '' },
  // Nowe pola:
  tags:       { type: [String], default: [] }, // Tablica stringów dla tagów
  calories:   { type: Number, default: null }, // Spalone kalorie
  avgHeartRate: { type: Number, default: null }, // Średnie tętno
  feeling:    { type: Number, default: null, min: 1, max: 5 }, // Samopoczucie (np. skala 1-5)
  pace:       { type: Number, default: null }, // Obliczone tempo w min/km
  speed:      { type: Number, default: null }  // Obliczona prędkość w km/h
}, { timestamps: true });

// Możemy dodać wirtualne pole, które sformatuje tempo na MM:SS
// To może być bardziej złożone i lepiej zrobić formatowanie na frontendzie,
// ale polecam obliczać i zapisywać pace/speed numerycznie na backendzie.

module.exports = mongoose.model('Activity', activitySchema);