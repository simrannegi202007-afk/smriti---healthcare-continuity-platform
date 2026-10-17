const db = require('../config/database');

function getAccessLogs(req, res) {
  try {
    const userId = req.user.id;
    // Return newest logs first by id DESC
    const logs = db.prepare('SELECT * FROM access_logs WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(userId);
    res.json(logs);
  } catch (err) {
    console.error('getAccessLogs error:', err);
    res.status(500).json({ error: 'Failed to retrieve privacy access logs' });
  }
}

module.exports = {
  getAccessLogs
};
