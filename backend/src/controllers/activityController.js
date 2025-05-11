const Activity = require('../models/Activity');

// Funkcja pomocnicza do obliczania tempa i prędkości
const calculatePaceAndSpeed = (distance, duration) => {
  let pace = null; // min/km
  let speed = null; // km/h

  if (distance > 0 && duration > 0) {
    // Obliczanie tempa (min/km)
    pace = duration / distance;

    // Obliczanie prędkości (km/h)
    speed = distance / (duration / 60);
  }

  return { pace, speed };
};


// GET /api/activities
exports.getActivities = async (req, res, next) => {
  try {
    // Możesz tutaj opcjonalnie dodać filtrowanie po tagach, jeśli chcesz
    // const filter = req.query.tags ? { tags: { $in: req.query.tags.split(',') } } : {};
    // const activities = await Activity.find(filter).sort({ date: -1 });
    const activities = await Activity.find().sort({ date: -1 }); // Póki co bez filtrowania tagów
    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// GET /api/activities/:id
exports.getSingleActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Nie znaleziono aktywności' });
    }
    res.json(activity);
  } catch (err) {
    // Sprawdzenie, czy błąd wynika z nieprawidłowego formatu ID (np. nie jest ObjectId)
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Nie znaleziono aktywności' });
    }
    next(err); // Przekazanie innych błędów do middleware
  }
};


// POST /api/activities
exports.createActivity = async (req, res, next) => {
  try {
    const { distance, duration, tags, ...rest } = req.body; // Pobierz nowe pola

    // Oblicz tempo i prędkość
    const { pace, speed } = calculatePaceAndSpeed(distance, duration);

    // Przetwórz tagi (zakładamy, że przychodzą jako string rozdzielony przecinkami)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];


    const newAct = await Activity.create({
      ...rest,
      distance,
      duration,
      tags: tagsArray, // Zapisz tablicę tagów
      pace, // Zapisz obliczone tempo
      speed // Zapisz obliczoną prędkość
    });
    res.status(201).json(newAct);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/activities/:id
exports.updateActivity = async (req, res, next) => {
  try {
    const { distance, duration, tags, ...rest } = req.body; // Pobierz nowe pola

    // Oblicz tempo i prędkość dla aktualizacji, jeśli zmieniono dystans lub czas trwania
    let pace = req.body.pace; // Zachowaj istniejące, jeśli nie zmieniono
    let speed = req.body.speed; // Zachowaj istniejące, jeśli nie zmieniono

    // Sprawdź, czy dystans LUB czas trwania są obecne w żądaniu LUB już istnieją w dokumencie
    // W praktyce najlepiej pobrać aktualne wartości z DB przed obliczeniem, aby uniknąć błędów,
    // ale na potrzeby uproszczenia, załóżmy, że req.body zawiera pełne dane lub tylko zmienione.
    // Bardziej robustne podejście wymagałoby `const existingActivity = await Activity.findById(req.params.id);`
    // i użycia `existingActivity.distance` i `existingActivity.duration` jeśli req.body ich nie zawiera.
    // Dla uproszczenia na razie:
    const currentDistance = distance !== undefined ? distance : null; // Użyj nowego jeśli jest, inaczej null
    const currentDuration = duration !== undefined ? duration : null; // Użyj nowego jeśli jest, inaczej null

    // Jeśli w żądaniu przyszły distance LUB duration (lub oba), przelicz pace/speed
    if (distance !== undefined || duration !== undefined) {
         // Aby poprawnie przeliczyć pace/speed przy częściowej aktualizacji,
         // najlepiej pobrać aktualny obiekt z bazy.
         const existingActivity = await Activity.findById(req.params.id);
         if (!existingActivity) {
             return res.status(404).json({ message: 'Nie znaleziono aktywności' });
         }
         const finalDistance = distance !== undefined ? distance : existingActivity.distance;
         const finalDuration = duration !== undefined ? duration : existingActivity.duration;

         const calculated = calculatePaceAndSpeed(finalDistance, finalDuration);
         pace = calculated.pace;
         speed = calculated.speed;
    }


    // Przetwórz tagi (zakładamy, że przychodzą jako string rozdzielony przecinkami)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];


    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        distance,
        duration,
        tags: tagsArray, // Zaktualizuj tablicę tagów
        pace, // Zaktualizuj obliczone tempo
        speed // Zaktualizuj obliczoną prędkość
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Nie znaleziono aktywności' });
    res.json(updated);
  } catch (err) {
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Nie znaleziono aktywności' });
     }
    next(err);
  }
};

// DELETE /api/activities/:id
exports.deleteActivity = async (req, res, next) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono aktywności do usunięcia' });
    res.json({ message: 'Usunięto aktywność' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Nie znaleziono aktywności do usunięcia' });
     }
    next(err);
  }
};