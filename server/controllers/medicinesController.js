const db = require('../config/database');

function getMedicines(req, res) {
  try {
    const userId = req.user.id;
    const meds = db.prepare('SELECT * FROM medicines WHERE user_id = ? ORDER BY is_active DESC, id DESC').all(userId);
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve medicines' });
  }
}

function addMedicine(req, res) {
  try {
    const userId = req.user.id;
    const { name, dose, frequency, timing, start_date, duration, notes } = req.body;

    if (!name || !dose) {
      return res.status(400).json({ error: 'Medicine name and dose are required' });
    }

    const insert = db.prepare(`
      INSERT INTO medicines (user_id, name, dose, frequency, timing, start_date, duration, is_active, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const result = insert.run(
      userId,
      name,
      dose,
      frequency || 'Once daily',
      timing || 'AFTER_MEALS',
      start_date || new Date().toISOString().split('T')[0],
      duration || 'Ongoing',
      notes || ''
    );

    const created = db.prepare('SELECT * FROM medicines WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add medicine' });
  }
}

function toggleMedicineStatus(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const current = db.prepare('SELECT is_active FROM medicines WHERE id = ? AND user_id = ?').get(id, userId);
    if (!current) return res.status(404).json({ error: 'Medicine not found' });

    const newStatus = current.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE medicines SET is_active = ? WHERE id = ?').run(newStatus, id);

    res.json({ success: true, is_active: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle medicine status' });
  }
}

function getReminders(req, res) {
  try {
    const userId = req.user.id;
    const reminders = db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY is_completed ASC, id ASC').all(userId);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}

function toggleReminder(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const current = db.prepare('SELECT is_completed FROM reminders WHERE id = ? AND user_id = ?').get(id, userId);
    if (!current) return res.status(404).json({ error: 'Reminder not found' });

    const newStatus = current.is_completed === 1 ? 0 : 1;
    db.prepare('UPDATE reminders SET is_completed = ? WHERE id = ?').run(newStatus, id);

    res.json({ success: true, is_completed: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle reminder' });
  }
}

module.exports = {
  getMedicines,
  addMedicine,
  toggleMedicineStatus,
  getReminders,
  toggleReminder
};
