import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Clock, 
  AlertOctagon, 
  Lock, 
  Droplet, 
  ShieldAlert, 
  Pill, 
  FileText, 
  Activity, 
  Plus, 
  CheckCircle,
  Building2,
  Calendar,
  Loader2
} from 'lucide-react';

export default function DoctorSummaryView({ token }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteDoctor, setNoteDoctor] = useState('Dr. Arvind Patil');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    fetchDoctorSummary();
  }, [token]);

  async function fetchDoctorSummary(otp = '') {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDoctorSummary(token, otp);
      setData(res);
      setNoteText(res.doctorNote || '');
    } catch (err) {
      setError(err.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.addDoctorNote(token, noteText, noteDoctor);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch (e) {
      alert('Failed to save doctor note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <p className="text-sm font-semibold">Loading consented patient summary...</p>
        </div>
      </div>
    );
  }

  // Handle Expired or Revoked Access (PRD Acceptance Criteria 7.9)
  if (error?.isExpired || error?.isRevoked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-300 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">{t('doctorView.expiredTitle')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error.error || t('doctorView.expiredDesc')}
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            Enforced by Smriti server-side consent protocol
          </div>
        </div>
      </div>
    );
  }

  // Handle PIN / OTP Challenge
  if (error?.requiresOtp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-xl text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Patient PIN Required</h2>
          <p className="text-xs text-slate-500">Please enter the 4-digit code provided by the patient to access this record.</p>
          <input
            type="password"
            maxLength="6"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="Enter PIN (e.g. 1234)"
            className="w-full text-center text-lg font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl py-2 font-bold"
          />
          <button
            onClick={() => fetchDoctorSummary(otpInput)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
          >
            Unlock Medical Summary
          </button>
        </div>
      </div>
    );
  }

  const patient = data?.patient;
  const records = data?.records || [];
  const activeMeds = data?.activeMedicines || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Doctor Security Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded font-black bg-blue-500 text-white text-[10px]">
              DOCTOR SECURE PORTAL
            </span>
            <span className="font-semibold text-blue-200">
              {t('doctorView.banner', {
                name: patient?.name,
                time: new Date(data?.expiresAt).toLocaleTimeString()
              })}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Time-limited Consented Access</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* Patient Profile Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                VERIFIED PATIENT HISTORY (स्मृती)
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">{patient?.name}</h1>
              <p className="text-xs text-slate-500">ABHA ID: {patient?.abha_id || '91-4523-8812-7019'} • Age: 62 • Female</p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-900">
                <span className="block text-[10px] font-bold text-red-600">BLOOD GROUP</span>
                <span className="text-lg font-black">{patient?.blood_group || 'B+'}</span>
              </div>
            </div>
          </div>

          {/* Allergies and Chronic Illnesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-red-50/80 border border-red-300 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 font-black text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>KNOWN CRITICAL ALLERGIES:</span>
              </div>
              <p className="font-bold text-red-800 text-sm">
                {(patient?.allergies || []).join(', ')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-600 uppercase">CHRONIC CONDITIONS:</span>
              <p className="font-semibold text-slate-800 text-sm">
                {(patient?.conditions || []).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Current Medications Strip */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Currently Active Medications ({activeMeds.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeMeds.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-0.5">
                <span className="font-extrabold text-slate-900 block">{m.name}</span>
                <span className="text-teal-700 font-bold">{m.dose} • {m.frequency}</span>
                <span className="text-slate-500 block text-[11px]">{m.timing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consented Cross-Hospital Timeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Consented Medical Records Across Hospitals ({records.length})</span>
          </h2>

          <div className="space-y-3">
            {records.map((rec) => (
              <div key={rec.id} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">{rec.date}</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {rec.hospital}
                    </span>
                    <span className="font-semibold text-slate-600">({rec.category})</span>
                  </div>
                  <span className="text-slate-500 font-medium">{rec.doctor}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{rec.ai_summary}</p>

                {rec.lab_values && rec.lab_values.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rec.lab_values.map((lv, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        lv.flag === 'high' ? 'bg-red-100 text-red-800' : lv.flag === 'low' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {lv.test_name}: {lv.value} {lv.unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Consultation Note Area (PRD 7.9) */}
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">{t('doctorView.addNote')}</h2>
          </div>

          <textarea
            rows="3"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('doctorView.notePlaceholder')}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
          ></textarea>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              value={noteDoctor}
              onChange={(e) => setNoteDoctor(e.target.value)}
              placeholder="Doctor Name (e.g. Dr. Arvind Patil)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 w-full sm:w-64"
            />
            <button
              onClick={handleSaveNote}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20 w-full sm:w-auto"
            >
              {t('doctorView.saveNote')}
            </button>
          </div>

          {noteSaved && (
            <p className="text-xs font-bold text-emerald-700 animate-fadeIn">
              ✓ Consultation note saved and added to patient's transparent access record.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
