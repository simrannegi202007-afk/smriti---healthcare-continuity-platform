const bcrypt = require('bcryptjs');
const db = require('../config/database');

function seedDatabase() {
  console.log('Seeding Smriti database with PRD demo patient (Mrs. Sunita Sharma)...');

  // Clear existing demo tables
  db.exec(`
    DELETE FROM access_logs;
    DELETE FROM emergency_cards;
    DELETE FROM share_links;
    DELETE FROM reminders;
    DELETE FROM medicines;
    DELETE FROM lab_values;
    DELETE FROM records;
    DELETE FROM health_profiles;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  // 1. Insert User
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, contact, password_hash, language, abha_id, settings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const userId = 1;
  insertUser.run(
    userId,
    'Mrs. Sunita Sharma',
    '9820098200',
    passwordHash,
    'mr', // Marathi default per PRD demo scenario
    '91-4523-8812-7019',
    JSON.stringify({ font_size: 'lg', simple_mode: true, notifications: true })
  );

  // 2. Insert Health Profile
  const insertProfile = db.prepare(`
    INSERT INTO health_profiles (user_id, blood_group, allergies, conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertProfile.run(
    userId,
    'B+',
    JSON.stringify(['Penicillin (Severe rash & swelling)', 'Sulfa Drugs']),
    JSON.stringify(['Type 2 Diabetes Mellitus (2 yrs)', 'Mild Hypertension', 'Bilateral Knee Osteoarthritis']),
    'Rohan Sharma (Son)',
    '+91 98201 12345',
    'Son'
  );

  // 3. Insert Records
  const insertRecord = db.prepare(`
    INSERT INTO records (id, user_id, date, hospital, doctor, category, file_name, file_path, file_hash, ai_summary, is_key_moment, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const recordsData = [
    {
      id: 1,
      date: '2024-01-14',
      hospital: 'K.E.M. Hospital, Parel, Mumbai',
      doctor: 'Dr. Arvind Patil (Endocrinology)',
      category: 'Discharge summary',
      fileName: 'kem_opd_summary_jan2024.pdf',
      fileHash: 'hash_kem_jan2024',
      aiSummary: 'Type 2 Diabetes & Mild Hypertension diagnosed. Lifestyle modifications & Metformin advised.',
      isKeyMoment: 1,
      notes: 'Initial evaluation after persistent fatigue and elevated glucose.'
    },
    {
      id: 2,
      date: '2024-04-10',
      hospital: 'Lilavati Hospital & Research Centre, Bandra',
      doctor: 'Dr. Neha Deshmukh (Pathologist)',
      category: 'Lab report',
      fileName: 'lilavati_metabolic_panel_apr2024.pdf',
      fileHash: 'hash_lilavati_apr2024',
      aiSummary: 'Comprehensive Metabolic Panel: HbA1c 8.4% (Elevated), FBS 172 mg/dL (High), Hemoglobin 11.2 g/dL (Mild Anemia).',
      isKeyMoment: 0,
      notes: 'Quarterly diabetic monitoring panel.'
    },
    {
      id: 3,
      date: '2024-05-18',
      hospital: 'K.E.M. Hospital, Parel, Mumbai',
      doctor: 'Dr. Arvind Patil',
      category: 'Prescription',
      fileName: 'kem_rx_may2024.jpg',
      fileHash: 'hash_kem_rx_may2024',
      aiSummary: 'Updated prescription adding Telmisartan 40mg for BP control and adjusting Metformin dosage.',
      isKeyMoment: 0,
      notes: 'Dosage adjustment follow-up.'
    },
    {
      id: 4,
      date: '2024-09-22',
      hospital: 'Ruby Hall Clinic, Pune',
      doctor: 'Dr. S. K. Joshi (Orthopedics)',
      category: 'Scan',
      fileName: 'ruby_knee_xray_sep2024.pdf',
      fileHash: 'hash_ruby_xray_sep2024',
      aiSummary: 'Bilateral knee standing X-ray reveals moderate joint space narrowing consistent with Grade II Osteoarthritis.',
      isKeyMoment: 0,
      notes: 'Reported persistent knee stiffness after stairs.'
    },
    {
      id: 5,
      date: '2024-11-05',
      hospital: 'Lilavati Hospital & Research Centre, Bandra',
      doctor: 'Dr. Neha Deshmukh (Pathologist)',
      category: 'Lab report',
      fileName: 'lilavati_lipid_glucose_nov2024.pdf',
      fileHash: 'hash_lilavati_nov2024',
      aiSummary: 'Diabetes Follow-up: HbA1c improved to 7.6%, FBS 148 mg/dL, Hemoglobin improved to 11.9 g/dL.',
      isKeyMoment: 0,
      notes: 'Significant improvement after diet control and regular walking.'
    },
    {
      id: 6,
      date: '2024-12-02',
      hospital: 'K.E.M. Hospital, Parel, Mumbai',
      doctor: 'Dr. S. K. Joshi (Orthopedics)',
      category: 'Discharge summary',
      fileName: 'kem_daycare_knee_procedure_dec2024.pdf',
      fileHash: 'hash_kem_dec2024',
      aiSummary: 'Left knee diagnostic arthroscopy & joint lavage performed. Discharged same evening in stable condition.',
      isKeyMoment: 1,
      notes: 'Minor daycare surgical procedure.'
    },
    {
      id: 7,
      date: '2025-02-14',
      hospital: 'Ruby Hall Clinic, Pune',
      doctor: 'Dr. Ananya Joshi (Preventive Medicine)',
      category: 'Vaccination',
      fileName: 'ruby_vaccine_certificate_feb2025.pdf',
      fileHash: 'hash_ruby_vac_feb2025',
      aiSummary: 'Administered Quadrivalent Influenza (Flu) & Pneumococcal polysaccharide booster doses.',
      isKeyMoment: 0,
      notes: 'Routine annual senior immunization.'
    },
    {
      id: 8,
      date: '2025-06-12',
      hospital: 'Lilavati Hospital & Research Centre, Bandra',
      doctor: 'Dr. Neha Deshmukh (Pathologist)',
      category: 'Lab report',
      fileName: 'lilavati_hba1c_complete_jun2025.pdf',
      fileHash: 'hash_lilavati_jun2025',
      aiSummary: 'Optimal Glycemic Control achieved: HbA1c 6.8% (Target reached), FBS 118 mg/dL, Hemoglobin 12.6 g/dL (Normal).',
      isKeyMoment: 0,
      notes: 'Best metabolic results in 2 years.'
    },
    {
      id: 9,
      date: '2025-08-20',
      hospital: 'K.E.M. Hospital, Parel, Mumbai',
      doctor: 'Dr. Arvind Patil',
      category: 'Prescription',
      fileName: 'kem_current_rx_aug2025.pdf',
      fileHash: 'hash_kem_rx_aug2025',
      aiSummary: 'Maintenance prescription confirmed: Continue Metformin 500mg BD & Telmisartan 40mg OD.',
      isKeyMoment: 0,
      notes: 'Six-month maintenance review.'
    }
  ];

  for (const r of recordsData) {
    insertRecord.run(
      r.id,
      userId,
      r.date,
      r.hospital,
      r.doctor,
      r.category,
      r.fileName,
      `/uploads/${r.fileName}`,
      r.fileHash,
      r.aiSummary,
      r.isKeyMoment,
      r.notes
    );
  }

  // 4. Insert Lab Values for Reports (specifically for Trend Charts across reports)
  const insertLabValue = db.prepare(`
    INSERT INTO lab_values (record_id, test_name, value, unit, reference_range, flag)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const labValuesData = [
    // Record 2 (Apr 2024)
    { recordId: 2, testName: 'HbA1c', value: 8.4, unit: '%', referenceRange: '4.0 - 5.6', flag: 'high' },
    { recordId: 2, testName: 'Fasting Blood Sugar', value: 172, unit: 'mg/dL', referenceRange: '70 - 99', flag: 'high' },
    { recordId: 2, testName: 'Hemoglobin', value: 11.2, unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'low' },
    { recordId: 2, testName: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: '0.6 - 1.2', flag: 'normal' },

    // Record 5 (Nov 2024)
    { recordId: 5, testName: 'HbA1c', value: 7.6, unit: '%', referenceRange: '4.0 - 5.6', flag: 'high' },
    { recordId: 5, testName: 'Fasting Blood Sugar', value: 148, unit: 'mg/dL', referenceRange: '70 - 99', flag: 'high' },
    { recordId: 5, testName: 'Hemoglobin', value: 11.9, unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'low' },
    { recordId: 5, testName: 'Total Cholesterol', value: 194, unit: 'mg/dL', referenceRange: '< 200', flag: 'normal' },

    // Record 8 (Jun 2025)
    { recordId: 8, testName: 'HbA1c', value: 6.8, unit: '%', referenceRange: '4.0 - 5.6', flag: 'normal' },
    { recordId: 8, testName: 'Fasting Blood Sugar', value: 118, unit: 'mg/dL', referenceRange: '70 - 99', flag: 'normal' },
    { recordId: 8, testName: 'Hemoglobin', value: 12.6, unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'normal' },
    { recordId: 8, testName: 'Serum Creatinine', value: 0.85, unit: 'mg/dL', referenceRange: '0.6 - 1.2', flag: 'normal' }
  ];

  for (const lv of labValuesData) {
    insertLabValue.run(lv.recordId, lv.testName, lv.value, lv.unit, lv.referenceRange, lv.flag);
  }

  // 5. Insert Medicines (3 current active)
  const insertMed = db.prepare(`
    INSERT INTO medicines (user_id, name, dose, frequency, timing, start_date, end_date, is_active, source_record_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMed.run(userId, 'Metformin Hydrochloride', '500 mg', 'Twice daily (1-0-1)', 'After meals (सकाळी आणि रात्री जेवणानंतर)', '2024-01-14', null, 1, 9, 'For diabetes glycemic control');
  insertMed.run(userId, 'Telmisartan', '40 mg', 'Once daily (1-0-0)', 'Morning before breakfast (सकाळी नाश्त्यापूर्वी)', '2024-05-18', null, 1, 9, 'For blood pressure management');
  insertMed.run(userId, 'Calcium Carbonate + Vitamin D3', '500 mg + 250 IU', 'Once daily (0-1-0)', 'After lunch (दुपारी जेवणानंतर)', '2024-09-22', null, 1, 9, 'For knee osteoarthritis bone density');

  // 6. Insert Reminders
  const insertReminder = db.prepare(`
    INSERT INTO reminders (user_id, type, title, schedule_time, is_completed)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertReminder.run(userId, 'medicine', 'Morning Telmisartan 40mg (BP Tablet)', '08:00 AM', 0);
  insertReminder.run(userId, 'medicine', 'Metformin 500mg after breakfast', '09:00 AM', 0);
  insertReminder.run(userId, 'test', 'Fasting Blood Glucose Home Test (Accu-Chek)', 'Tomorrow 07:30 AM', 0);
  insertReminder.run(userId, 'follow_up', 'Dr. Arvind Patil Review - KEM Hospital OPD', '2026-11-10 10:30 AM', 0);

  // 7. Insert Ready Doctor Share Link
  const insertShare = db.prepare(`
    INSERT INTO share_links (id, user_id, token, otp, record_ids, expires_at, is_revoked, doctor_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  insertShare.run(
    1,
    userId,
    'demo-doc-24h',
    '1234',
    'ALL',
    tomorrow,
    0,
    'Patient presented for routine annual review. Glycemic control stable.'
  );

  // 8. Insert Ready Emergency Card
  const insertEmergency = db.prepare(`
    INSERT INTO emergency_cards (user_id, token, is_enabled, visible_fields)
    VALUES (?, ?, ?, ?)
  `);

  insertEmergency.run(
    userId,
    'emergency-sunita-sharma',
    1,
    JSON.stringify(['blood_group', 'allergies', 'conditions', 'medicines', 'emergency_contact'])
  );

  // 9. Insert Access Logs
  const insertLog = db.prepare(`
    INSERT INTO access_logs (user_id, accessor_name, channel, action, records_viewed, ip_type, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLog.run(
    userId,
    'Dr. Arvind Patil (K.E.M. Hospital)',
    'doctor_link',
    'Viewed 24-hour Consented Patient Summary',
    'All 9 Records & Lab Trends',
    'Hospital Intranet (Mumbai)',
    '2025-08-20 11:15:32'
  );

  insertLog.run(
    userId,
    'Apollo Emergency Casualty Desk',
    'emergency_qr',
    'Scanned Emergency QR Code (Unauthenticated life-saving triage)',
    'Blood Group B+, Penicillin Allergy, Active Meds',
    'Emergency Mobile Scan (Mumbai)',
    '2024-12-02 08:44:19'
  );

  insertLog.run(
    userId,
    'Dr. S. K. Joshi (Ruby Hall Clinic)',
    'doctor_link',
    'Inspected Knee X-Ray & MRI Scans',
    'Record #4 (Scan / X-Ray)',
    'Clinic Desktop (Pune)',
    '2024-09-22 16:30:10'
  );

  console.log('✅ Smriti database seeded successfully with Mrs. Sunita Sharma data!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
