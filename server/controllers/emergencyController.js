const crypto = require('crypto');
const db = require('../config/database');

function getEmergencyCard(req, res) {
  try {
    const { token } = req.params;
    const card = db.prepare('SELECT * FROM emergency_cards WHERE token = ?').get(token);

    if (!card) {
      return res.status(404).json({ error: 'Emergency record card not found.' });
    }

    // Patient can disable the QR at any time (PRD Section 7.10)
    if (card.is_enabled === 0) {
      // Log blocked scan attempt on disabled emergency card
      db.prepare(`
        INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
        VALUES (?, 'EMERGENCY_RESPONDER', 'emergency_qr', 'ACCESS_DENIED_REVOKED', 'NONE', 'EMERGENCY_SCAN')
      `).run(card.user_id);

      return res.status(403).json({
        isDisabled: true,
        error: 'Access ended. This emergency card has been deactivated by the patient.'
      });
    }

    const user = db.prepare('SELECT id, name, abha_id FROM users WHERE id = ?').get(card.user_id);
    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(card.user_id);
    const meds = db.prepare('SELECT name, dose, frequency FROM medicines WHERE user_id = ? AND is_active = 1').all(card.user_id);

    let visibleFields = ['name', 'age', 'blood_group', 'allergies', 'conditions', 'medicines', 'emergency_contact'];
    try {
      visibleFields = JSON.parse(card.visible_fields || '[]');
    } catch (e) {}

    // Log this emergency triage scan in access_logs (PRD Section 7.11 P0)
    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, 'EMERGENCY_RESPONDER', 'emergency_qr', 'EMERGENCY_CARD_VIEWED', 'EMERGENCY_FIELDS', 'EMERGENCY_SCAN')
    `).run(card.user_id);

    const responseData = {
      isEnabled: true,
      lastUpdated: card.updated_at,
      visibleFields
    };

    if (visibleFields.includes('name')) {
      responseData.patientName = user.name;
    }
    if (visibleFields.includes('age')) {
      responseData.age = 62; // Demo patient age
      responseData.abhaId = user.abha_id;
    }
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
      // Long random token (PRD Section 9)
      const token = 'emg-' + crypto.randomBytes(16).toString('hex');
      db.prepare(`
        INSERT INTO emergency_cards (user_id, token, is_enabled, visible_fields)
        VALUES (?, ?, 1, ?)
      `).run(userId, token, JSON.stringify(['name', 'age', 'blood_group', 'allergies', 'conditions', 'medicines', 'emergency_contact']));
      card = db.prepare('SELECT * FROM emergency_cards WHERE user_id = ?').get(userId);
    }

    // Log the viewing of emergency card in access_logs (PRD Section 7.11)
    let visibleFields = [];
    try {
      visibleFields = JSON.parse(card.visible_fields || '[]');
    } catch (e) {}

    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, 'PATIENT', 'emergency_qr', 'EMERGENCY_CARD_VIEWED', 'EMERGENCY_FIELDS', 'PATIENT_PORTAL')
    `).run(userId);

    res.json({
      ...card,
      visible_fields: visibleFields
    });
  } catch (err) {
    console.error('getMyEmergencyCard error:', err);
    res.status(500).json({ error: 'Failed to get emergency settings' });
  }
}

function updateEmergencyCard(req, res) {
  try {
    const userId = req.user.id;
    const { isEnabled, visibleFields } = req.body;

    const visibleFieldsStr = Array.isArray(visibleFields) ? JSON.stringify(visibleFields) : visibleFields;
    const enabledVal = (isEnabled === true || isEnabled === 1) ? 1 : 0;

    db.prepare(`
      UPDATE emergency_cards 
      SET is_enabled = ?, visible_fields = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(enabledVal, visibleFieldsStr, userId);

    // Log the configuration change in access_logs
    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, 'PATIENT', 'emergency_qr', 'SETTINGS_UPDATED', 'EMERGENCY_FIELDS', 'SETTINGS_PORTAL')
    `).run(userId);

    res.json({ success: true, message: 'Emergency card settings updated' });
  } catch (err) {
    console.error('updateEmergencyCard error:', err);
    res.status(500).json({ error: 'Failed to update emergency card' });
  }
}

module.exports = {
  getEmergencyCard,
  getMyEmergencyCard,
  updateEmergencyCard
};
