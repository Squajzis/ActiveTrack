const express = require('express');
const router = express.Router();
const stravaController = require('../controllers/stravaController');

// Punkt wejścia do autoryzacji Strava
router.get('/auth', stravaController.redirectToStravaAuth);

// Endpoint do obsługi przekierowania zwrotnego po autoryzacji
router.get('/callback', stravaController.handleStravaCallback);

// Endpoint do importu aktywności (może być wywoływany z frontendu po autoryzacji)
// TODO: W prawdziwej aplikacji, ten endpoint powinien wymagać autoryzacji użytkownika aplikacji, a nie opierać się na globalnych tokenach.
router.get('/import', stravaController.importStravaActivities);

module.exports = router;