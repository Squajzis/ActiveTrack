const express = require('express');
const router = express.Router();
const {
  getNotes,
  getSingleNote, // Import the new function
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getSingleNote) // Add the GET route for a single note
  .patch(updateNote)
  .delete(deleteNote);

module.exports = router;