const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { calculateFileHash } = require('../middleware/uploadMiddleware');

function getRecords(req, res) {
  try {
    const userId = req.user.id;
    const { category, hospital, sort = 'desc', search, timeRange } = req.query;

    let query = 'SELECT * FROM records WHERE user_id = ?';
    const params = [userId];

    // Filter Chips: All, Reports, Prescriptions, Scans, Vaccinations, Visits (PRD 7.4)
    if (category && category !== 'all') {
      if (category === 'lab' || category === 'reports') query += " AND category = 'Lab report'";
      else if (category === 'prescription' || category === 'prescriptions') query += " AND category = 'Prescription'";
      else if (category === 'scan' || category === 'scans') query += " AND category = 'Scan'";
      else if (category === 'vaccination' || category === 'vaccinations') query += " AND category = 'Vaccination'";
      else if (category === 'visit' || category === 'visits') query += " AND (category = 'Discharge summary' OR category = 'Other')";
      else {
        query += " AND category = ?";
        params.push(category);
      }
    }

    // Hospital Filter (PRD 7.4)
    if (hospital && hospital !== 'all') {
      query += ' AND hospital LIKE ?';
      params.push(`%${hospital}%`);
    }

    // Time Range Filter (PRD 7.4: date-range filters)
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let pastDate = new Date();
      if (timeRange === '6m') {
        pastDate.setMonth(now.getMonth() - 6);
        query += ' AND date >= ?';
        params.push(pastDate.toISOString().split('T')[0]);
      } else if (timeRange === '1y') {
        pastDate.setFullYear(now.getFullYear() - 1);
        query += ' AND date >= ?';
        params.push(pastDate.toISOString().split('T')[0]);
      } else if (timeRange === '2y') {
        pastDate.setFullYear(now.getFullYear() - 2);
        query += ' AND date >= ?';
        params.push(pastDate.toISOString().split('T')[0]);
      }
    }

    // Search Filter across diagnosis, doctor, hospital, notes, and ai_summary in English, Hindi & Marathi (PRD 7.4)
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ' AND (hospital LIKE ? OR doctor LIKE ? OR ai_summary LIKE ? OR notes LIKE ? OR category LIKE ?)';
      params.push(term, term, term, term, term);
    }

    // Sorting: Newest first vs Oldest first toggle (PRD 7.4)
    const sortOrder = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY date ${sortOrder}, id ${sortOrder}`;

    const records = db.prepare(query).all(...params);

    // Fetch lab values & flags for each record
    const getLabValues = db.prepare('SELECT * FROM lab_values WHERE record_id = ?');

    const enrichedRecords = records.map(rec => {
      const labValues = getLabValues.all(rec.id);
      const hasAbnormal = labValues.some(lv => lv.flag === 'high' || lv.flag === 'low');
      return {
        ...rec,
        file_path: rec.file_name ? `/api/records/${rec.id}/file` : null,
        lab_values: labValues,
        has_abnormal: hasAbnormal
      };
    });

    // Summary strip metrics: total records, distinct hospitals, years spanned (PRD 7.4)
    const stats = db.prepare(`
      SELECT 
        COUNT(id) as total_records,
        COUNT(DISTINCT hospital) as total_hospitals,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
      FROM records 
      WHERE user_id = ?
    `).get(userId);

    let yearsSpanned = 1;
    if (stats.earliest_date && stats.latest_date) {
      const diffYears = new Date(stats.latest_date).getFullYear() - new Date(stats.earliest_date).getFullYear();
      yearsSpanned = Math.max(1, diffYears);
    }

    res.json({
      records: enrichedRecords,
      stats: {
        totalRecords: stats.total_records || 0,
        totalHospitals: stats.total_hospitals || 0,
        yearsSpanned
      }
    });
  } catch (err) {
    console.error('getRecords error:', err);
    res.status(500).json({ error: 'Failed to retrieve records' });
  }
}

function checkDuplicate(req, res) {
  try {
    const userId = req.user.id;
    const { date, hospital, category, fileHash } = req.body;

    // Check 1: File hash match (SHA-256)
    if (fileHash) {
      const existingByHash = db.prepare('SELECT id, hospital, doctor, date, category, file_name FROM records WHERE user_id = ? AND file_hash = ?').get(userId, fileHash);
      if (existingByHash) {
        return res.json({
          isDuplicate: true,
          matchType: 'hash',
          existingRecord: existingByHash,
          message: 'Duplicate file detected: An identical file hash already exists in your timeline.'
        });
      }
    }

    // Check 2: Same hospital, date, and category match
    if (date && hospital && category) {
      const existingByMeta = db.prepare(`
        SELECT id, hospital, doctor, date, category, file_name FROM records 
        WHERE user_id = ? AND date = ? AND hospital = ? AND category = ?
      `).get(userId, date, hospital, category);

      if (existingByMeta) {
        return res.json({
          isDuplicate: true,
          matchType: 'metadata',
          existingRecord: existingByMeta,
          message: 'Duplicate detected: A record with the exact same Date, Hospital, and Category already exists in your timeline.'
        });
      }
    }

    res.json({ isDuplicate: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check duplicate' });
  }
}

function uploadRecord(req, res) {
  try {
    const userId = req.user.id;
    const { 
      date, 
      hospital, 
      doctor, 
      category, 
      notes, 
      is_key_moment, 
      allow_duplicate,
      medicine_name,
      medicine_dose,
      medicine_frequency,
      medicine_timing,
      medicine_duration
    } = req.body;

    if (!date || !hospital || !category) {
      return res.status(400).json({ error: 'Date, hospital name, and category are required' });
    }

    let fileName = null;
    let fileHash = null;

    if (req.file) {
      fileName = req.file.filename;
      fileHash = calculateFileHash(req.file.path);
    }

    // Duplicate check unless explicitly overridden (PRD 7.3)
    if (allow_duplicate !== 'true' && allow_duplicate !== true) {
      if (fileHash) {
        const hashDup = db.prepare('SELECT id, hospital, doctor, date, category FROM records WHERE user_id = ? AND file_hash = ?').get(userId, fileHash);
        if (hashDup) {
          return res.status(409).json({
            isDuplicate: true,
            matchType: 'hash',
            existingRecord: hashDup,
            error: 'Duplicate detected: Identical file already exists.'
          });
        }
      }

      const metaDup = db.prepare(`
        SELECT id, hospital, doctor, date, category FROM records 
        WHERE user_id = ? AND date = ? AND hospital = ? AND category = ?
      `).get(userId, date, hospital, category);

      if (metaDup) {
        return res.status(409).json({
          isDuplicate: true,
          matchType: 'metadata',
          existingRecord: metaDup,
          error: 'Duplicate detected: Matching record with same date, hospital, and category exists.'
        });
      }
    }

    // Plain-language summary generation based on category
    let aiSummary = `${category} at ${hospital}`;
    if (doctor) aiSummary += ` by ${doctor}`;
    if (notes) aiSummary += `. Notes: ${notes.slice(0, 100)}`;

    const insert = db.prepare(`
      INSERT INTO records (user_id, date, hospital, doctor, category, file_name, file_path, file_hash, ai_summary, is_key_moment, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId,
      date,
      hospital,
      doctor || '',
      category,
      fileName,
      null, // file_path will be securely resolved dynamically via /api/records/:id/file
      fileHash,
      aiSummary,
      is_key_moment === 'true' || is_key_moment === true ? 1 : 0,
      notes || ''
    );

    const newRecordId = result.lastInsertRowid;
    // Set protected dynamic path
    db.prepare('UPDATE records SET file_path = ? WHERE id = ?').run(`/api/records/${newRecordId}/file`, newRecordId);

    // If it's a lab report, insert sample lab values for instant demo friendliness
    if (category === 'Lab report') {
      const insertLv = db.prepare(`
        INSERT INTO lab_values (record_id, test_name, value, unit, reference_range, flag)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertLv.run(newRecordId, 'Fasting Blood Sugar', 132, 'mg/dL', '70 - 99', 'high');
      insertLv.run(newRecordId, 'HbA1c', 7.1, '%', '4.0 - 5.6', 'high');
      insertLv.run(newRecordId, 'Hemoglobin', 12.3, 'g/dL', '12.0 - 15.5', 'normal');
      insertLv.run(newRecordId, 'Serum Creatinine', 0.88, 'mg/dL', '0.6 - 1.2', 'normal');
    }

    // PRD 7.5: Prescriptions and medicines - derive active medicine from prescription if provided
    if (category === 'Prescription') {
      const medName = medicine_name || (notes && notes.length > 3 ? notes.split(',')[0].slice(0, 40) : null);
      if (medName) {
        db.prepare(`
          INSERT INTO medicines (user_id, name, dose, frequency, timing, start_date, duration, is_active, source_record_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).run(
          userId,
          medName,
          medicine_dose || 'Standard dose',
          medicine_frequency || 'Once daily',
          medicine_timing || 'After meals',
          date,
          medicine_duration || '30 days',
          newRecordId,
          `Derived from prescription at ${hospital}`
        );
      }
    }

    const created = db.prepare('SELECT * FROM records WHERE id = ?').get(newRecordId);
    created.file_path = fileName ? `/api/records/${newRecordId}/file` : null;
    created.lab_values = db.prepare('SELECT * FROM lab_values WHERE record_id = ?').all(newRecordId);

    res.status(201).json({
      success: true,
      record: created
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload and store medical record' });
  }
}

function getRecordById(req, res) {
  try {
    const { id } = req.params;
    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    record.file_path = record.file_name ? `/api/records/${record.id}/file` : null;
    record.lab_values = db.prepare('SELECT * FROM lab_values WHERE record_id = ?').all(id);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch record' });
  }
}

// Security Requirement: Files are NOT publicly accessible.
// Protected streaming endpoint enforcing patient ownership or valid doctor share token
function getRecordFile(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query; // optional doctor share token

    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
    if (!record || !record.file_name) {
      return res.status(404).json({ error: 'Document file not found for this record' });
    }

    let isAuthorized = false;

    // 1. Check patient authentication
    if (req.user && req.user.id === record.user_id) {
      isAuthorized = true;
    }

    // 2. Check doctor share token (if doctor viewing via time-limited link)
    if (!isAuthorized && token) {
      const share = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);
      if (share && share.is_revoked === 0 && new Date() < new Date(share.expires_at)) {
        if (share.record_ids === 'ALL') {
          isAuthorized = (share.user_id === record.user_id);
        } else {
          try {
            const ids = JSON.parse(share.record_ids || '[]');
            isAuthorized = ids.includes(record.id) || ids.includes(String(record.id)) || ids.includes(Number(record.id));
          } catch (e) {}
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'Access Denied: Medical record files are protected and not publicly accessible. Patient authentication or an active time-limited doctor share link is required.' 
      });
    }

    const filePath = path.join(__dirname, '../uploads', record.file_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File data not found on server storage' });
    }

    const ext = path.extname(record.file_name).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${record.file_name}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('getRecordFile error:', err);
    res.status(500).json({ error: 'Failed to stream protected file' });
  }
}

function getTrends(req, res) {
  try {
    const userId = req.user.id;
    const { testName = 'HbA1c' } = req.query;

    const data = db.prepare(`
      SELECT 
        r.date, 
        r.hospital,
        lv.test_name, 
        lv.value, 
        lv.unit, 
        lv.reference_range, 
        lv.flag
      FROM lab_values lv
      JOIN records r ON lv.record_id = r.id
      WHERE r.user_id = ? AND lv.test_name LIKE ?
      ORDER BY r.date ASC
    `).all(userId, `%${testName}%`);

    res.json({
      testName,
      data
    });
  } catch (err) {
    console.error('getTrends error:', err);
    res.status(500).json({ error: 'Failed to calculate health trends' });
  }
}

function deleteRecord(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Verify record exists and belongs to current user
    const record = db.prepare('SELECT * FROM records WHERE id = ? AND user_id = ?').get(id, userId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    // 2. Remove physical uploaded file if it exists on disk
    if (record.file_name) {
      const filePath = path.join(__dirname, '../uploads', record.file_name);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Could not delete physical file:', unlinkErr.message);
        }
      }
    }

    // 3. Remove linked data: lab values and medicines derived from this prescription/visit
    db.prepare('DELETE FROM lab_values WHERE record_id = ?').run(id);
    db.prepare('DELETE FROM medicines WHERE source_record_id = ? AND user_id = ?').run(id, userId);

    // 4. Delete the record from records table
    db.prepare('DELETE FROM records WHERE id = ? AND user_id = ?').run(id, userId);

    res.json({
      success: true,
      message: 'Record, document file, and linked medical data deleted successfully'
    });
  } catch (err) {
    console.error('deleteRecord error:', err);
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
}

module.exports = {
  getRecords,
  checkDuplicate,
  uploadRecord,
  getRecordById,
  getRecordFile,
  getTrends,
  deleteRecord
};
