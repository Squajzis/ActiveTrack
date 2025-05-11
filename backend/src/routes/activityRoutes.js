const express = require('express');
const router = express.Router();
const {
  getActivities,
  getSingleActivity, // Import the new function
  createActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/:id')
  .get(getSingleActivity) // Add the GET route for a single activity
  .patch(updateActivity)
  .delete(deleteActivity);

module.exports = router;