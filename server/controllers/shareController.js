const crypto = require('crypto');
const db = require('../config/database');

function createShareLink(req, res) {
  try {
    const userId = req.user.id;
    const { durationHours = 24, recordIds = 'ALL', otp = '' } = req.body;

    const token = 'doc-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const insert = db.prepare(`
      INSERT INTO share_links (user_id, token, otp, record_ids, expires_at, is_revoked)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    const result = insert.run(
      userId,
      token,
      otp || null,
      typeof recordIds === 'object' ? JSON.stringify(recordIds) : recordIds,
      expiresAt
    );

    res.status(201).json({
      success: true,
      shareId: result.lastInsertRowid,
      token,
      expiresAt,
      shareUrl: `/shared/doctor/${token}`
    });
  } catch (err) {
    console.error('createShareLink error:', err);
    res.status(500).json({ error: 'Failed to create doctor share link' });
  }
}

function getDoctorSummary(req, res) {
  try {
    const { token } = req.params;
    const { otp, doctorName = 'Visiting Consulting Doctor' } = req.query;

    const share = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);
    if (!share) {
      return res.status(404).json({ error: 'Share link not found or invalid' });
    }

    if (share.is_revoked === 1) {
      return res.status(403).json({
        isRevoked: true,
        error: 'Access ended. The patient has revoked access to this medical record link.'
      });
    }

    const now = new Date();
    const expiry = new Date(share.expires_at);
    if (now > expiry) {
      return res.status(403).json({
        isExpired: true,
        error: 'Access window expired. The time-limited consent window for this doctor link has ended.'
      });
    }

    if (share.otp && share.otp !== otp) {
      return res.status(401).json({
        requiresOtp: true,
        error: 'This record summary is protected by patient PIN/OTP.'
      });
    }

    // Retrieve Patient Profile
    const user = db.prepare('SELECT id, name, contact, language, abha_id FROM users WHERE id = ?').get(share.user_id);
    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(share.user_id);
    const meds = db.prepare('SELECT * FROM medicines WHERE user_id = ? AND is_active = 1').all(share.user_id);

    // Retrieve Records based on consent
    let records = [];
    if (share.record_ids === 'ALL') {
      records = db.prepare('SELECT * FROM records WHERE user_id = ? ORDER BY date DESC').all(share.user_id);
    } else {
      let ids = [];
      try { ids = JSON.parse(share.record_ids); } catch (e) { ids = []; }
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        records = db.prepare(`SELECT * FROM records WHERE id IN (${placeholders}) ORDER BY date DESC`).all(...ids);
      }
    }

    // Attach lab values to records
    const getLabValues = db.prepare('SELECT * FROM lab_values WHERE record_id = ?');
    const enrichedRecords = records.map(r => ({
      ...r,
      lab_values: getLabValues.all(r.id)
    }));

    // Log this access in access_logs
    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, ?, 'doctor_link', 'Doctor viewed consented summary page', ?, 'Clinical Web Link')
    `).run(
      share.user_id,
      doctorName,
      `${enrichedRecords.length} records, profile & active meds`
    );

    res.json({
      success: true,
      patient: {
        name: user.name,
        abha_id: user.abha_id,
        blood_group: profile ? profile.blood_group : 'Unknown',
        allergies: profile ? JSON.parse(profile.allergies || '[]') : [],
        conditions: profile ? JSON.parse(profile.conditions || '[]') : [],
        emergency_contact_name: profile ? profile.emergency_contact_name : '',
        emergency_contact_phone: profile ? profile.emergency_contact_phone : ''
      },
      activeMedicines: meds,
      records: enrichedRecords,
      expiresAt: share.expires_at,
      doctorNote: share.doctor_note || '',
      token: share.token
    });
  } catch (err) {
    console.error('getDoctorSummary error:', err);
    res.status(500).json({ error: 'Failed to load doctor summary' });
  }
}

function addDoctorNote(req, res) {
  try {
    const { token } = req.params;
    const { note, doctorName = 'Attending Doctor' } = req.body;

    const share = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);
    if (!share) return res.status(404).json({ error: 'Link not found' });

    db.prepare('UPDATE share_links SET doctor_note = ? WHERE token = ?').run(note, token);

    // Also log this clinical action
    db.prepare(`
      INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type)
      VALUES (?, ?, 'doctor_link', 'Added visit clinical observation note', 'Appended consultation note', 'Doctor Portal')
    `).run(share.user_id, doctorName);

    res.json({ success: true, message: 'Consultation note saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to append doctor note' });
  }
}

function revokeShareLink(req, res) {
  try {
    const userId = req.user.id;
    const { shareId, token } = req.body;

    let update;
    if (shareId) {
      update = db.prepare('UPDATE share_links SET is_revoked = 1 WHERE id = ? AND user_id = ?').run(shareId, userId);
    } else if (token) {
      update = db.prepare('UPDATE share_links SET is_revoked = 1 WHERE token = ? AND user_id = ?').run(token, userId);
    }

    res.json({ success: true, message: 'Doctor access revoked immediately.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke access' });
  }
}

function listActiveShares(req, res) {
  try {
    const userId = req.user.id;
    const shares = db.prepare(`
      SELECT * FROM share_links 
      WHERE user_id = ? AND is_revoked = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all(userId);

    res.json({ shares });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list active shares' });
  }
}

module.exports = {
  createShareLink,
  getDoctorSummary,
  addDoctorNote,
  revokeShareLink,
  listActiveShares
};
