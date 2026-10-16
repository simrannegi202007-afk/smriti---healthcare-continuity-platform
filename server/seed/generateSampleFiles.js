const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function createTextPdf(filename, hospital, date, title, content) {
  const filePath = path.join(uploadDir, filename);
  
  // Clean valid PDF 1.4 representation
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 16 Tf
50 720 Td
(${hospital} - ${title}) Tj
/F1 10 Tf
0 -30 Td
(Date: ${date} | Patient: Mrs. Sunita Sharma | Age: 62) Tj
0 -25 Td
(${content}) Tj
0 -40 Td
(CONFIDENTIAL MEDICAL DOCUMENT - SMRITI CONTINUITY PLATFORM) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000227 00000 n 
0000000480 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
554
%%EOF`;

  fs.writeFileSync(filePath, pdfContent);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  return { filename, hash };
}

function createSampleImage(filename, title) {
  const filePath = path.join(uploadDir, filename);
  // Valid minimal 1x1 JPEG or valid image buffer
  const sampleBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);
  fs.writeFileSync(filePath, sampleBuffer);
  const hash = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
  return { filename, hash };
}

function generateAllSampleFiles() {
  console.log('Generating sample medical PDF & JPG files in uploads directory...');

  const files = [
    createTextPdf('kem_opd_summary_jan2024.pdf', 'K.E.M. Hospital, Parel, Mumbai', '2024-01-14', 'OPD Summary', 'Diagnosis: Type 2 Diabetes Mellitus & Mild Hypertension. Started Metformin 500mg.'),
    createTextPdf('lilavati_metabolic_panel_apr2024.pdf', 'Lilavati Hospital, Bandra', '2024-04-10', 'Comprehensive Metabolic Panel', 'HbA1c: 8.4% (High) | Fasting Blood Sugar: 172 mg/dL (High) | Hemoglobin: 11.2 g/dL'),
    createSampleImage('kem_rx_may2024.jpg', 'Prescription May 2024'),
    createTextPdf('ruby_knee_xray_sep2024.pdf', 'Ruby Hall Clinic, Pune', '2024-09-22', 'Bilateral Knee Standing X-Ray', 'Findings: Moderate joint space narrowing bilateral knees. Grade II Osteoarthritis.'),
    createTextPdf('lilavati_lipid_glucose_nov2024.pdf', 'Lilavati Hospital, Bandra', '2024-11-05', 'Quarterly Diabetes Monitoring', 'HbA1c: 7.6% (Improved) | Fasting Blood Sugar: 148 mg/dL | Hemoglobin: 11.9 g/dL'),
    createTextPdf('kem_daycare_knee_procedure_dec2024.pdf', 'K.E.M. Hospital, Parel, Mumbai', '2024-12-02', 'Daycare Arthroscopy Discharge Summary', 'Procedure: Left knee diagnostic arthroscopy & joint lavage. Discharged stable.'),
    createTextPdf('ruby_vaccine_certificate_feb2025.pdf', 'Ruby Hall Clinic, Pune', '2025-02-14', 'Vaccination Certificate', 'Administered: Quadrivalent Influenza Vaccine & Pneumococcal Polysaccharide Vaccine.'),
    createTextPdf('lilavati_hba1c_complete_jun2025.pdf', 'Lilavati Hospital, Bandra', '2025-06-12', 'Comprehensive Glycemic Control Panel', 'HbA1c: 6.8% (Target Reached) | Fasting Glucose: 118 mg/dL | Hemoglobin: 12.6 g/dL'),
    createTextPdf('kem_current_rx_aug2025.pdf', 'K.E.M. Hospital, Parel, Mumbai', '2025-08-20', 'Current Maintenance Prescription', 'Metformin 500mg BD | Telmisartan 40mg OD | Calcium + Vitamin D3 OD')
  ];

  console.log(`Generated ${files.length} sample records.`);
  return files;
}

if (require.main === module) {
  generateAllSampleFiles();
}

module.exports = generateAllSampleFiles;
