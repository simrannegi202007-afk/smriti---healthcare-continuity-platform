const db = require('../config/database');

function getEmergencyCard(req, res) {
  try {
    const { token } = req.params;
    const card = db.prepare('SELECT * FROM emergency_cards WHERE token = ?').get(token);

    if (!card) {
      return res.status(404).json({ error: 'Emergency record card not found.' });
    }

    if (card.is_enabled === 0) {
      return res.status(403).json({
        isDisabled: true,
        error: 'This emergency card has been deactivated by the patient.'
      });
    }

    const user = db.prepare('SELECT id, name, abha_id FROM users WHERE id = ?').get(card.user_id);
    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(card.user_id);
    const meds = db.prepare('SELECT name, dose, frequency FROM medicines WHERE user_id = ? AND is_active = 1').all(card.user_id);

    let visibleFields = ['blood_group', 'allergies', 'conditions', 'medicines', 'emergency_contact'];
    try {
      visibleFields = JSON.parse(card.visible_fields || '[]');
    } catch (e) {}

    // Log this emergency triage scan
    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, 'Emergency Responder (QR Scan)', 'emergency_qr', 'Scanned Emergency Medical QR Card (Unauthenticated)', 'Blood group, allergies, emergency contact', 'Mobile Browser')
    `).run(card.user_id);

    const responseData = {
      patientName: user.name,
      abhaId: user.abha_id,
      isEnabled: true,
      lastUpdated: card.updated_at
    };

    if (visibleFields.includes('blood_group') && profile) {
      responseData.bloodGroup = profile.blood_group;
    }
    if (visibleFields.includes('allergies') && profile) {
      responseData.allergies = JSON.parse(profile.allergies || '[]');
    }
    if (visibleFields.includes('conditions') && profile) {
      responseData.conditions = JSON.parse(profile.conditions || '[]');
    }
    if (visibleFields.includes('emergency_contact') && profile) {
      responseData.emergencyContact = {
        name: profile.emergency_contact_name,
        phone: profile.emergency_contact_phone,
        relation: profile.emergency_contact_relation
      };
    }
    if (visibleFields.includes('medicines')) {
      responseData.activeMedicines = meds;
    }

    res.json(responseData);
  } catch (err) {
    console.error('getEmergencyCard error:', err);
    res.status(500).json({ error: 'Failed to fetch emergency card' });
  }
}

function getMyEmergencyCard(req, res) {
  try {
    const userId = req.user.id;
    let card = db.prepare('SELECT * FROM emergency_cards WHERE user_id = ?').get(userId);

    if (!card) {
      const token = 'emg-' + Math.random().toString(36).substring(2, 10);
      db.prepare(`
        INSERT INTO emergency_cards (user_id, token, is_enabled, visible_fields)
        VALUES (?, ?, 1, ?)
      `).run(userId, token, JSON.stringify(['blood_group', 'allergies', 'conditions', 'medicines', 'emergency_contact']));
      card = db.prepare('SELECT * FROM emergency_cards WHERE user_id = ?').get(userId);
    }

    res.json({
      ...card,
      visible_fields: JSON.parse(card.visible_fields || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get emergency settings' });
  }
}

function updateEmergencyCard(req, res) {
  try {
    const userId = req.user.id;
    const { isEnabled, visibleFields } = req.body;

    const visibleFieldsStr = Array.isArray(visibleFields) ? JSON.stringify(visibleFields) : visibleFields;

    db.prepare(`
      UPDATE emergency_cards 
      SET is_enabled = ?, visible_fields = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(isEnabled ? 1 : 0, visibleFieldsStr, userId);

    res.json({ success: true, message: 'Emergency card settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update emergency card' });
  }
}

module.exports = {
  getEmergencyCard,
  getMyEmergencyCard,
  updateEmergencyCard
};
