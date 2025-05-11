const Note = require('../models/Note');

// GET /api/notes
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

// GET /api/notes/:id
exports.getSingleNote = async (req, res, next) => { // Added function
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Nie znaleziono notatki' });
    }
    res.json(note);
  } catch (err) {
    next(err); // Pass errors to the error middleware
  }
};

// POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create(req.body);
    res.status(201).json(newNote);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Nie znaleziono notatki' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id); // Added 'deleted' to check if found
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono notatki do usunięcia' }); // Added check
    res.json({ message: 'Usunięto notatkę' });
  } catch (err) {
    next(err);
  }
};