const db = require('../config/database');

function getAccessLogs(req, res) {
  try {
    const userId = req.user.id;
    const logs = db.prepare('SELECT * FROM access_logs WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve privacy access logs' });
  }
}

module.exports = {
  getAccessLogs
};
