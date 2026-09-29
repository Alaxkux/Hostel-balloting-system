const db = require('../db');

const VALID_GENDERS = ['male', 'female'];
const VALID_STATUSES = ['active', 'inactive'];
const MAX_CAPACITY = 5000;

const validateHostelInput = ({ name, gender, capacity, location }) => {
  if (!name || !String(name).trim()) return 'Hostel name is required';
  if (String(name).trim().length > 100) return 'Hostel name is too long (100 characters max)';
  if (!VALID_GENDERS.includes(gender)) return 'Gender must be male or female';
  if (!/^\d+$/.test(String(capacity).trim())) return 'Capacity must be a whole number';

  const cap = Number(capacity);
  if (cap < 1 || cap > MAX_CAPACITY) return `Capacity must be between 1 and ${MAX_CAPACITY}`;

  if (location && String(location).length > 150) return 'Location is too long (150 characters max)';
  return null;
};

const isNameTaken = (name, excludeId, callback) => {
  db.query(
    'SELECT id FROM hostels WHERE LOWER(name) = LOWER(?) AND id <> ?',
    [name, excludeId || 0],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows.length > 0);
    }
  );
};

const getAllHostels = (req, res) => {
  db.query(
    'SELECT id, name, gender, capacity, available_slots, location, status FROM hostels',
    (err, results) => {
      if (err) {
        console.error('Error fetching hostels:', err.message);
        return res.status(500).json({ error: 'Failed to fetch hostels' });
      }
      res.json(results);
    }
  );
};

//create hostel
// a new hostel is empty, so available slots always equal capacity
const createHostel = (req, res) => {
  const validationError = validateHostelInput(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, gender, capacity, location } = req.body;
  const cleanName = String(name).trim();
  const cap = Number(capacity);
  const cleanLocation = location && String(location).trim() ? String(location).trim() : null;

  isNameTaken(cleanName, null, (err, taken) => {
    if (err) {
      console.error('Error checking hostel name:', err.message);
      return res.status(500).json({ error: 'Failed to create hostel' });
    }

    if (taken) {
      return res.status(409).json({ error: 'A hostel with that name already exists' });
    }

    const sql = 'INSERT INTO hostels (name, gender, capacity, available_slots, location, status) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(sql, [cleanName, gender, cap, cap, cleanLocation, 'active'], (err, result) => {
      if (err) {
        console.error('Error creating hostel:', err.message);
        return res.status(500).json({ error: 'Failed to create hostel' });
      }
      res.status(201).json({ message: 'Hostel created successfully', hostelId: result.insertId });
    });
  });
};

//update hostel
// available slots are recalculated from what is already occupied
const updateHostel = (req, res) => {
  const hostelId = req.params.id;
  const validationError = validateHostelInput(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, gender, capacity, location } = req.body;
  const cleanName = String(name).trim();
  const cap = Number(capacity);
  const cleanLocation = location && String(location).trim() ? String(location).trim() : null;

  db.query('SELECT capacity, available_slots, gender FROM hostels WHERE id = ?', [hostelId], (err, rows) => {
    if (err) {
      console.error('Error fetching hostel:', err.message);
      return res.status(500).json({ error: 'Failed to update hostel' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    const current = rows[0];
    const occupied = current.capacity - current.available_slots;

    if (cap < occupied) {
      return res.status(400).json({ error: `Capacity cannot be lower than the ${occupied} bed spaces already occupied` });
    }

    if (gender !== current.gender && occupied > 0) {
      return res.status(400).json({ error: 'Gender cannot be changed while the hostel has occupants' });
    }

    isNameTaken(cleanName, hostelId, (err, taken) => {
      if (err) {
        console.error('Error checking hostel name:', err.message);
        return res.status(500).json({ error: 'Failed to update hostel' });
      }

      if (taken) {
        return res.status(409).json({ error: 'A hostel with that name already exists' });
      }

      const sql = 'UPDATE hostels SET name = ?, gender = ?, capacity = ?, available_slots = ?, location = ? WHERE id = ?';

      db.query(sql, [cleanName, gender, cap, cap - occupied, cleanLocation, hostelId], (err) => {
        if (err) {
          console.error('Error updating hostel:', err.message);
          return res.status(500).json({ error: 'Failed to update hostel' });
        }
        res.json({ message: 'Hostel updated successfully' });
      });
    });
  });
};

// deactivate / reactivate a hostel
const updateHostelStatus = (req, res) => {
  const hostelId = req.params.id;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Status must be active or inactive' });
  }

  db.query('UPDATE hostels SET status = ? WHERE id = ?', [status, hostelId], (err, result) => {
    if (err) {
      console.error('Error updating hostel status:', err.message);
      return res.status(500).json({ error: 'Failed to update hostel status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    res.json({ message: status === 'active' ? 'Hostel reactivated successfully' : 'Hostel deactivated successfully' });
  });
};

//delete hostel
// only allowed when nothing references this hostel
const deleteHostel = (req, res) => {
  const hostelId = req.params.id;

  const usageSql = `
    SELECT
      (SELECT COUNT(*) FROM application_hostel_choices WHERE hostel_id = ?) AS choices,
      (SELECT COUNT(*) FROM results WHERE hostel_id = ?) AS allocations
  `;

  const inUseMessage = 'This hostel is already used by student applications or results, so it cannot be deleted. Deactivate it instead.';

  db.query(usageSql, [hostelId, hostelId], (err, rows) => {
    if (err) {
      console.error('Error checking hostel usage:', err.message);
      return res.status(500).json({ error: 'Failed to delete hostel' });
    }

    if (rows[0].choices > 0 || rows[0].allocations > 0) {
      return res.status(409).json({ error: inUseMessage });
    }

    db.query('DELETE FROM hostels WHERE id = ?', [hostelId], (err, result) => {
      if (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(409).json({ error: inUseMessage });
        }
        console.error('Error deleting hostel:', err.message);
        return res.status(500).json({ error: 'Failed to delete hostel' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Hostel not found' });
      }

      res.json({ message: 'Hostel deleted successfully' });
    });
  });
};

module.exports = { getAllHostels, createHostel, updateHostel, updateHostelStatus, deleteHostel };