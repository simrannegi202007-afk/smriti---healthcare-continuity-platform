const db = require('../config/database');
const { calculateFileHash } = require('../middleware/uploadMiddleware');

function getRecords(req, res) {
  try {
    const userId = req.user.id;
    const { category, hospital, sort = 'desc', search } = req.query;

    let query = 'SELECT * FROM records WHERE user_id = ?';
    const params = [userId];

    if (category && category !== 'all') {
      if (category === 'lab') query += " AND category = 'Lab report'";
      else if (category === 'prescription') query += " AND category = 'Prescription'";
      else if (category === 'scan') query += " AND category = 'Scan'";
      else if (category === 'vaccination') query += " AND category = 'Vaccination'";
      else if (category === 'visit') query += " AND (category = 'Discharge summary' OR category = 'Other')";
    }

    if (hospital) {
      query += ' AND hospital LIKE ?';
      params.push(`%${hospital}%`);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ' AND (hospital LIKE ? OR doctor LIKE ? OR ai_summary LIKE ? OR notes LIKE ? OR category LIKE ?)';
      params.push(term, term, term, term, term);
    }

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
        lab_values: labValues,
        has_abnormal: hasAbnormal
      };
    });

    // Compute summary strip metrics (records count, distinct hospitals, years spanned)
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

    // Check 1: File hash match
    if (fileHash) {
      const existingByHash = db.prepare('SELECT id, hospital, date, category FROM records WHERE user_id = ? AND file_hash = ?').get(userId, fileHash);
      if (existingByHash) {
        return res.json({
          isDuplicate: true,
          matchType: 'hash',
          existingRecord: existingByHash,
          message: 'An identical file has already been uploaded previously.'
        });
      }
    }

    // Check 2: Same hospital, date, and category match
    if (date && hospital && category) {
      const existingByMeta = db.prepare(`
        SELECT id, hospital, date, category FROM records 
        WHERE user_id = ? AND date = ? AND hospital = ? AND category = ?
      `).get(userId, date, hospital, category);

      if (existingByMeta) {
        return res.json({
          isDuplicate: true,
          matchType: 'metadata',
          existingRecord: existingByMeta,
          message: 'A record with the exact same Hospital, Date, and Category already exists in your timeline.'
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
    const { date, hospital, doctor, category, notes, is_key_moment, allow_duplicate } = req.body;

    if (!date || !hospital || !category) {
      return res.status(400).json({ error: 'Date, hospital name, and category are required' });
    }

    let fileName = null;
    let filePath = null;
    let fileHash = null;

    if (req.file) {
      fileName = req.file.filename;
      filePath = `/uploads/${fileName}`;
      fileHash = calculateFileHash(req.file.path);
    }

    // Duplicate check unless explicitly overridden
    if (allow_duplicate !== 'true' && allow_duplicate !== true) {
      if (fileHash) {
        const hashDup = db.prepare('SELECT id, hospital, date, category FROM records WHERE user_id = ? AND file_hash = ?').get(userId, fileHash);
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
        SELECT id, hospital, date, category FROM records 
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

    // Default AI summary generator based on category
    let aiSummary = `${category} at ${hospital}`;
    if (doctor) aiSummary += ` by ${doctor}`;

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
      filePath,
      fileHash,
      aiSummary,
      is_key_moment === 'true' || is_key_moment === true ? 1 : 0,
      notes || ''
    );

    const newRecordId = result.lastInsertRowid;

    // If it's a lab report, insert sample lab values for instant demo friendliness
    if (category === 'Lab report') {
      const insertLv = db.prepare(`
        INSERT INTO lab_values (record_id, test_name, value, unit, reference_range, flag)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertLv.run(newRecordId, 'Fasting Blood Sugar', 135, 'mg/dL', '70 - 99', 'high');
      insertLv.run(newRecordId, 'Post Prandial Glucose', 185, 'mg/dL', '< 140', 'high');
      insertLv.run(newRecordId, 'HbA1c', 7.2, '%', '4.0 - 5.6', 'high');
      insertLv.run(newRecordId, 'Serum Creatinine', 0.9, 'mg/dL', '0.6 - 1.2', 'normal');
    }

    const created = db.prepare('SELECT * FROM records WHERE id = ?').get(newRecordId);
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

    record.lab_values = db.prepare('SELECT * FROM lab_values WHERE record_id = ?').all(id);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch record' });
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

module.exports = {
  getRecords,
  checkDuplicate,
  uploadRecord,
  getRecordById,
  getTrends
};
