const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function login(req, res) {
  try {
    const { contact, password } = req.body;
    if (!contact || !password) {
      return res.status(400).json({ error: 'Contact number and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE contact = ?').get(contact);
    if (!user) {
      return res.status(401).json({ error: 'Invalid mobile number or credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid mobile number or credentials' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, contact: user.contact }, JWT_SECRET, {
      expiresIn: '7d'
    });

    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(user.id);
    let settings = {};
    try {
      settings = JSON.parse(user.settings || '{}');
    } catch (e) {}

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        contact: user.contact,
        language: user.language,
        abha_id: user.abha_id,
        settings,
        profile: profile ? {
          blood_group: profile.blood_group,
          allergies: JSON.parse(profile.allergies || '[]'),
          conditions: JSON.parse(profile.conditions || '[]'),
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          emergency_contact_relation: profile.emergency_contact_relation
        } : null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

function register(req, res) {
  try {
    const { name, contact, password, language = 'en', abha_id } = req.body;
    if (!name || !contact || !password) {
      return res.status(400).json({ error: 'Name, contact number and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE contact = ?').get(contact);
    if (existing) {
      return res.status(400).json({ error: 'An account with this contact number already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const initialSettings = JSON.stringify({ font_size: 'md', simple_mode: true });

    const insertUser = db.prepare(`
      INSERT INTO users (name, contact, password_hash, language, abha_id, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(name, contact, passwordHash, language, abha_id || null, initialSettings);
    const userId = result.lastInsertRowid;

    // Default health profile
    db.prepare(`
      INSERT INTO health_profiles (user_id, blood_group, allergies, conditions)
      VALUES (?, ?, ?, ?)
    `).run(userId, '', '[]', '[]');

    // Default emergency card
    const emergencyToken = 'emg-' + Math.random().toString(36).substring(2, 10);
    db.prepare(`
      INSERT INTO emergency_cards (user_id, token, is_enabled, visible_fields)
      VALUES (?, ?, 1, ?)
    `).run(userId, emergencyToken, JSON.stringify(['blood_group', 'allergies', 'conditions', 'emergency_contact']));

    const token = jwt.sign({ id: userId, name, contact }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        contact,
        language,
        abha_id: abha_id || null,
        settings: { font_size: 'md', simple_mode: true },
        profile: {
          blood_group: '',
          allergies: [],
          conditions: [],
          emergency_contact_name: '',
          emergency_contact_phone: ''
        }
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

function getMe(req, res) {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(user.id);
    let settings = {};
    try {
      settings = JSON.parse(user.settings || '{}');
    } catch (e) {}

    res.json({
      user: {
        id: user.id,
        name: user.name,
        contact: user.contact,
        language: user.language,
        abha_id: user.abha_id,
        settings,
        profile: profile ? {
          blood_group: profile.blood_group,
          allergies: JSON.parse(profile.allergies || '[]'),
          conditions: JSON.parse(profile.conditions || '[]'),
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          emergency_contact_relation: profile.emergency_contact_relation
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

function updateSettings(req, res) {
  try {
    const { language, settings } = req.body;
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!current) return res.status(404).json({ error: 'User not found' });

    let existingSettings = {};
    try { existingSettings = JSON.parse(current.settings || '{}'); } catch (e) {}

    const updatedSettings = { ...existingSettings, ...(settings || {}) };
    const updatedLang = language || current.language;

    db.prepare('UPDATE users SET language = ?, settings = ? WHERE id = ?')
      .run(updatedLang, JSON.stringify(updatedSettings), req.user.id);

    res.json({ success: true, language: updatedLang, settings: updatedSettings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

function updateProfile(req, res) {
  try {
    const { 
      blood_group, 
      allergies, 
      conditions, 
      emergency_contact_name, 
      emergency_contact_phone, 
      emergency_contact_relation,
      abha_id 
    } = req.body;

    const allergiesStr = Array.isArray(allergies) ? JSON.stringify(allergies) : allergies;
    const conditionsStr = Array.isArray(conditions) ? JSON.stringify(conditions) : conditions;

    const exists = db.prepare('SELECT id FROM health_profiles WHERE user_id = ?').get(req.user.id);
    if (exists) {
      db.prepare(`
        UPDATE health_profiles
        SET blood_group = ?, allergies = ?, conditions = ?, 
            emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(blood_group, allergiesStr, conditionsStr, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, req.user.id);
    } else {
      db.prepare(`
        INSERT INTO health_profiles (user_id, blood_group, allergies, conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, blood_group, allergiesStr, conditionsStr, emergency_contact_name, emergency_contact_phone, emergency_contact_relation);
    }

    if (abha_id !== undefined) {
      db.prepare('UPDATE users SET abha_id = ? WHERE id = ?').run(abha_id || null, req.user.id);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const updatedProfile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(req.user.id);

    res.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        contact: updatedUser.contact,
        language: updatedUser.language,
        abha_id: updatedUser.abha_id,
        profile: {
          blood_group: updatedProfile.blood_group,
          allergies: JSON.parse(updatedProfile.allergies || '[]'),
          conditions: JSON.parse(updatedProfile.conditions || '[]'),
          emergency_contact_name: updatedProfile.emergency_contact_name,
          emergency_contact_phone: updatedProfile.emergency_contact_phone,
          emergency_contact_relation: updatedProfile.emergency_contact_relation
        }
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update health profile' });
  }
}

function deleteMyData(req, res) {
  try {
    const userId = req.user.id;
    // Delete all records and dependent items
    db.prepare('DELETE FROM access_logs WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM emergency_cards WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM share_links WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM reminders WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM medicines WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM records WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM health_profiles WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ success: true, message: 'All patient health data permanently deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete health data' });
  }
}

module.exports = {
  login,
  register,
  getMe,
  updateSettings,
  updateProfile,
  deleteMyData
};
