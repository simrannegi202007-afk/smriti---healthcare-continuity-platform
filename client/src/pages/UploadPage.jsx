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
  ArrowRight
} from 'lucide-react';

export default function UploadPage({ onUploadSuccess }) {
  const { t } = useTranslation();
  
  const [file, setFile] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('Lilavati Hospital & Research Centre, Bandra');
  const [doctor, setDoctor] = useState('Dr. Neha Deshmukh');
  const [category, setCategory] = useState('Lab report');
  const [notes, setNotes] = useState('');
  const [isKeyMoment, setIsKeyMoment] = useState(false);

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

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    }
  };

  const handleSubmit = async (allowDuplicate = false) => {
    setLoading(true);
    try {
      // 1. Perform duplicate check if not allowed yet
      if (!allowDuplicate) {
        const dupCheck = await api.checkDuplicate({
          date,
          hospital,
          category
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

      const res = await api.uploadRecord(formData);
      setSuccessMessage(true);
      setDuplicateModalOpen(false);

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(res.record);
      }, 1200);
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
          {t('app.tagline')} • AI duplicate check and timeline categorization
        </p>
      </div>

      {/* Demo Fast Helper Buttons */}
      <div className="bg-slate-100 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-600">⚡ Demo Presets:</span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleQuickFillSample('duplicate')}
            className="px-3 py-1.5 bg-amber-200 text-amber-950 font-bold rounded-xl hover:bg-amber-300 transition"
            title="Pre-fills existing record to trigger PRD duplicate warning demonstration"
          >
            ⚠️ Duplicate Test Record
          </button>
          <button
            type="button"
            onClick={() => handleQuickFillSample('new')}
            className="px-3 py-1.5 bg-teal-200 text-teal-950 font-bold rounded-xl hover:bg-teal-300 transition"
          >
            ✨ New Clean Record
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
              <p className="text-xs text-teal-600">{(file.size / 1024).toFixed(1)} KB • Ready to save</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-800">{t('upload.dragDrop')}</p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, PNG from mobile or scan</p>
            </div>
          )}
        </div>

        {/* Metadata Inputs */}
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

          {/* Key Moment Toggle */}
          <div className="sm:col-span-2 flex items-center space-x-2 p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
            <input
              type="checkbox"
              id="keyMomentCheck"
              checked={isKeyMoment}
              onChange={(e) => setIsKeyMoment(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="keyMomentCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
              महत्त्वपूर्ण घटना म्हणून चिन्हांकित करा (Key Moment - Surgery / Major Diagnosis / Admission)
            </label>
          </div>

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

      {/* Duplicate Alert Modal */}
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
