import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  User, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Pill,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function UploadPage({ onUploadSuccess }) {
  const { t } = useTranslation();
  
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('Lilavati Hospital & Research Centre, Bandra');
  const [doctor, setDoctor] = useState('Dr. Neha Deshmukh');
  const [category, setCategory] = useState('Lab report');
  const [notes, setNotes] = useState('');
  const [isKeyMoment, setIsKeyMoment] = useState(false);

  // Prescription Medicine Fields (PRD 7.5)
  const [addPrescriptionMed, setAddPrescriptionMed] = useState(true);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFrequency, setMedFrequency] = useState('Twice daily (1-0-1)');
  const [medDuration, setMedDuration] = useState('30 days');
  const [medTiming, setMedTiming] = useState('After meals');

  const [loading, setLoading] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const hospitalsList = [
    'Lilavati Hospital & Research Centre, Bandra',
    'K.E.M. Hospital, Parel, Mumbai',
    'Ruby Hall Clinic, Pune',
    'Tata Memorial Hospital, Mumbai',
    'Kokilaben Dhirubhai Ambani Hospital, Andheri',
    'Other City Clinic'
  ];

  const categories = [
    { id: 'Lab report', label: t('upload.categories.lab') },
    { id: 'Prescription', label: t('upload.categories.prescription') },
    { id: 'Scan', label: t('upload.categories.scan') },
    { id: 'Discharge summary', label: t('upload.categories.discharge') },
    { id: 'Vaccination', label: t('upload.categories.vaccination') },
    { id: 'Other', label: t('upload.categories.other') }
  ];

  const computeFileHash = async (fileObj) => {
    if (!fileObj) return null;
    try {
      const buffer = await fileObj.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Could not compute client file hash:', e);
      return null;
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      const hash = await computeFileHash(selected);
      setFileHash(hash);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const hash = await computeFileHash(selected);
      setFileHash(hash);
    }
  };

  // Demo helper: Quick populate sample report
  const handleQuickFillSample = (type) => {
    if (type === 'duplicate') {
      // Intentionally triggers duplicate warning per PRD Section 15 demo script step 3:
      // "Upload a lab report, then show the duplicate warning (20 seconds)."
      setDate('2025-06-12');
      setHospital('Lilavati Hospital & Research Centre, Bandra');
      setDoctor('Dr. Neha Deshmukh (Pathologist)');
      setCategory('Lab report');
      setNotes('Routine quarterly blood test');
    } else {
      // New record
      setDate(new Date().toISOString().split('T')[0]);
      setHospital('K.E.M. Hospital, Parel, Mumbai');
      setDoctor('Dr. Arvind Patil');
      setCategory('Prescription');
      setNotes('New consultation prescription for routine maintenance');
      setMedName('Glimepiride');
      setMedDose('1 mg');
      setMedFrequency('Once daily (1-0-0)');
      setMedDuration('60 days');
    }
  };

  const handleSubmit = async (allowDuplicate = false) => {
    setLoading(true);
    try {
      // 1. Perform duplicate check if not allowed yet
      if (!allowDuplicate) {
        let currentHash = fileHash;
        if (!currentHash && file) {
          currentHash = await computeFileHash(file);
          setFileHash(currentHash);
        }

        const dupCheck = await api.checkDuplicate({
          date,
          hospital,
          category,
          fileHash: currentHash
        });

        if (dupCheck.isDuplicate) {
          setDuplicateInfo(dupCheck);
          setDuplicateModalOpen(true);
          setLoading(false);
          return;
        }
      }

      // 2. Prepare FormData
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('date', date);
      formData.append('hospital', hospital);
      formData.append('doctor', doctor);
      formData.append('category', category);
      formData.append('notes', notes);
      formData.append('is_key_moment', isKeyMoment);
      formData.append('allow_duplicate', allowDuplicate);

      // If prescription with medicine details entered (PRD 7.5)
      if (category === 'Prescription' && addPrescriptionMed && medName.trim()) {
        formData.append('medicine_name', medName.trim());
        formData.append('medicine_dose', medDose.trim() || 'Standard dose');
        formData.append('medicine_frequency', medFrequency);
        formData.append('medicine_duration', medDuration);
        formData.append('medicine_timing', medTiming);
      }

      const res = await api.uploadRecord(formData);
      setSuccessMessage(true);
      setDuplicateModalOpen(false);

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(res.record);
      }, 1000);
    } catch (err) {
      if (err.status === 409 && err.data?.isDuplicate) {
        setDuplicateInfo(err.data);
        setDuplicateModalOpen(true);
      } else {
        alert(err.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('upload.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t('app.tagline')} • AI duplicate check, confidential storage & timeline integration
        </p>
      </div>

      {/* Demo Fast Helper Buttons */}
      <div className="bg-slate-100 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-600">⚡ Demo Presets:</span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleQuickFillSample('duplicate')}
            className="px-3 py-1.5 bg-amber-200 text-amber-950 font-bold rounded-xl hover:bg-amber-300 transition tap-target"
            title="Pre-fills existing record to trigger PRD duplicate warning demonstration"
          >
            ⚠️ Duplicate Test Record
          </button>
          <button
            type="button"
            onClick={() => handleQuickFillSample('new')}
            className="px-3 py-1.5 bg-teal-200 text-teal-950 font-bold rounded-xl hover:bg-teal-300 transition tap-target"
          >
            ✨ New Prescription Record
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 rounded-3xl p-6 text-center cursor-pointer transition relative"
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          {file ? (
            <div>
              <p className="text-sm font-bold text-teal-900">{file.name}</p>
              <p className="text-xs text-teal-600">{(file.size / 1024).toFixed(1)} KB • Ready to save securely</p>
              {fileHash && (
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  SHA-256: {fileHash.slice(0, 16)}...
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-800">{t('upload.dragDrop')}</p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, PNG from mobile or scanner (Max 25MB)</p>
            </div>
          )}
        </div>

        {/* Metadata Inputs (PRD 7.3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">{t('upload.date')} *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">{t('upload.category')} *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Hospital / Clinic */}
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">{t('upload.hospital')} *</label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="उदा. K.E.M. Hospital, Mumbai किंवा Lilavati Hospital"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Doctor Name */}
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">{t('upload.doctor')}</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="उदा. Dr. Arvind Patil (Endocrinologist)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* PRD 7.5: Prescription & Medicine Derivation Section */}
          {category === 'Prescription' && (
            <div className="sm:col-span-2 bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-blue-700" />
                  <span>{t('upload.medicineDetails') || 'Prescription Medicine Details'}</span>
                </span>
                <label className="flex items-center space-x-1 text-[11px] font-semibold text-blue-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addPrescriptionMed}
                    onChange={(e) => setAddPrescriptionMed(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>{t('upload.addToActiveMeds') || 'Add to active medicines list'}</span>
                </label>
              </div>

              {addPrescriptionMed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('upload.medName') || 'Medicine Name'}
                    </label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="उदा. Metformin 500mg किंवा Glimepiride"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('upload.medDose') || 'Dose'}
                    </label>
                    <input
                      type="text"
                      value={medDose}
                      onChange={(e) => setMedDose(e.target.value)}
                      placeholder="उदा. 500 mg / 1 गोळी"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('upload.medFreq') || 'Frequency'}
                    </label>
                    <select
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    >
                      <option value="Once daily (1-0-0)">Once daily (1-0-0)</option>
                      <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                      <option value="Thrice daily (1-1-1)">Thrice daily (1-1-1)</option>
                      <option value="As needed (SOS)">As needed (SOS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('upload.medDuration') || 'Duration'}
                    </label>
                    <input
                      type="text"
                      value={medDuration}
                      onChange={(e) => setMedDuration(e.target.value)}
                      placeholder="उदा. 30 days, 90 days, किंवा Ongoing"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">{t('upload.notes')}</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="महिनाभरानंतर फॉलो-अप, औषध बदल किंवा लक्षणे..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          {/* Key Moment Toggle (PRD 7.4) */}
          <div className="sm:col-span-2 flex items-center space-x-2 p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
            <input
              type="checkbox"
              id="keyMomentCheck"
              checked={isKeyMoment}
              onChange={(e) => setIsKeyMoment(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="keyMomentCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
              {t('upload.markKeyMoment')}
            </label>
          </div>

        </div>

        {/* Security notice */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>सुरक्षित स्टोरेज: तुमचे वैद्यकीय दस्तऐवज सार्वजनिकरित्या उपलब्ध नसतात (Private streaming only).</span>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading || !hospital || !date}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 tap-target text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('upload.uploading')}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>{t('upload.submit')}</span>
            </>
          )}
        </button>

        {successMessage && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold text-center animate-fadeIn">
            ✓ {t('upload.success')}
          </div>
        )}

      </div>

      {/* Duplicate Alert Modal (PRD 7.3) */}
      {duplicateModalOpen && (
        <DuplicateWarningModal
          duplicateInfo={duplicateInfo}
          onProceed={() => handleSubmit(true)}
          onCancel={() => setDuplicateModalOpen(false)}
        />
      )}

    </div>
  );
}
