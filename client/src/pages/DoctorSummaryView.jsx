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
  Loader2,
  Eye,
  X,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Download,
  AlertTriangle
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
  const [savingNote, setSavingNote] = useState(false);
  
  // File preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

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
    setSavingNote(true);
    try {
      await api.addDoctorNote(token, noteText, noteDoctor);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3500);
    } catch (e) {
      alert('Failed to save doctor note: ' + (e.message || 'Error'));
    } finally {
      setSavingNote(false);
    }
  };

  const handleOpenOriginalFile = async (record) => {
    setFileLoading(true);
    try {
      // In doctor portal, stream via token-protected endpoint
      const streamUrl = `/api/records/${record.id}/file?token=${encodeURIComponent(token)}`;
      setPreviewFile({
        ...record,
        streamUrl
      });
    } catch (e) {
      console.error(e);
    } finally {
      setFileLoading(false);
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

  // Handle Expired or Revoked Access (PRD Acceptance Criteria Section 7.9)
  if (error?.isExpired || error?.isRevoked) {
    const isRevoked = error?.isRevoked;
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-300 rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl animate-scaleUp">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto border-2 border-red-200">
            <AlertOctagon className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800">
              {isRevoked ? t('share.revoked') : t('share.expired')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('doctorView.expiredTitle')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {error.error || (isRevoked 
                ? 'The patient has revoked access to this medical record link.' 
                : 'The time-limited consent window for this doctor link has expired.')}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 border border-slate-200 space-y-1 text-left">
            <div className="flex items-center space-x-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Smriti Server-Side Security Enforcement</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Medical records in Smriti are never permanently public. Access is strictly time-bound and can be terminated by the patient at any time in compliance with DPDP & ABDM principles.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Return to Smriti Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle PIN / OTP Challenge (PRD Section 7.9)
  if (error?.requiresOtp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-8 max-w-sm w-full space-y-5 shadow-2xl text-center animate-scaleUp">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 mx-auto border border-indigo-200">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Patient PIN Required</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This patient has secured their summary with a 4-digit PIN. Please enter the code given by the patient.
            </p>
          </div>
          
          <input
            type="password"
            maxLength="6"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="Enter 4-digit PIN (e.g. 1234)"
            className="w-full text-center text-xl font-mono tracking-widest bg-slate-50 border-2 border-slate-300 rounded-2xl py-3 font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
          />

          <button
            onClick={() => fetchDoctorSummary(otpInput)}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition shadow-md shadow-indigo-600/30 tap-target"
          >
            Unlock Consented Summary
          </button>

          <p className="text-[11px] text-slate-400">Demo preset PIN: 1234</p>
        </div>
      </div>
    );
  }

  const patient = data?.patient;
  const records = data?.records || [];
  const activeMeds = data?.activeMedicines || [];
  const trends = data?.trends || [];

  // Group trends by test name
  const trendTests = {};
  trends.forEach(t => {
    if (!trendTests[t.test_name]) trendTests[t.test_name] = [];
    trendTests[t.test_name].push(t);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      
      {/* Top Doctor Security Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-40 border-b border-indigo-950">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full font-black bg-blue-500 text-white text-[10px] tracking-wider uppercase">
              {t('doctorView.badge')}
            </span>
            <span className="font-bold text-blue-200">
              Patient: <strong className="text-white">{patient?.name}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Expires: <strong className="text-white">{new Date(data?.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({new Date(data?.expiresAt).toLocaleDateString()})
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-blue-200 font-bold">
              Time-Limited
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* Patient Profile Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black text-teal-700 uppercase tracking-widest flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>VERIFIED PATIENT HEALTH CONTINUITY</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{patient?.name}</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ABHA ID: <span className="font-mono font-bold text-slate-700">{patient?.abha_id || '91-4523-8812-7019'}</span> • Age: 62 • Female • Maharashtra
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-900 text-center min-w-[90px]">
                <span className="block text-[10px] font-black text-red-600 uppercase">{t('emergency.bloodGroup')}</span>
                <span className="text-2xl font-black">{patient?.blood_group || 'B+'}</span>
              </div>
            </div>
          </div>

          {/* Allergies and Chronic Illnesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Prominent Allergy Warning (PRD Section 7.6) */}
            <div className="p-4 bg-red-50/90 border-2 border-red-300 rounded-2xl space-y-1 text-red-950 shadow-xs">
              <div className="flex items-center space-x-2 font-black text-red-800 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
                <span>{t('doctorView.criticalAllergies')}:</span>
              </div>
              <p className="font-black text-red-900 text-sm sm:text-base pl-7">
                {(patient?.allergies || []).join(', ') || 'No known drug allergies'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">{t('doctorView.chronicConditions')}:</span>
              <p className="font-extrabold text-slate-800 text-sm">
                {(patient?.conditions || []).join(', ')}
              </p>
              {patient?.emergency_contact_name && (
                <p className="text-[11px] text-slate-500 pt-1">
                  {t('emergency.contact')}: <strong className="text-slate-700">{patient.emergency_contact_name}</strong> ({patient.emergency_contact_phone})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Active Medications Strip */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>{t('doctorView.activeMeds')} ({activeMeds.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeMeds.map((m, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="font-black text-slate-900 text-sm block">{m.name}</span>
                <span className="text-teal-700 font-black block">{m.dose} • {m.frequency}</span>
                <span className="text-slate-500 block text-[11px]">{m.timing}</span>
                <span className="text-[10px] text-slate-400 block pt-0.5">Duration: {m.duration || 'Ongoing'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Report Lab Trends (PRD Section 7.8 & 7.9) */}
        {trends.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>{t('doctorView.labTrendsTitle')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {t('doctorView.normalRangeShaded')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(trendTests).slice(0, 4).map(([testName, points]) => {
                const latest = points[points.length - 1];
                const first = points[0];
                const isDecreasing = parseFloat(latest.value) < parseFloat(first.value);
                const isNormal = latest.flag === 'normal';
                
                return (
                  <div key={testName} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{testName}</h4>
                        <span className="text-[11px] text-slate-500">Ref Range: {latest.reference_range} {latest.unit}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 ${
                        isNormal ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span>{isNormal ? '✓ In Range' : '🔺 High'}</span>
                      </span>
                    </div>

                    {/* Timeline Progression Line */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        {points.map((pt, pIdx) => (
                          <div key={pIdx} className="text-center">
                            <span className="block text-[10px] text-slate-400">{pt.date}</span>
                            <span className={`text-sm font-black ${
                              pt.flag === 'high' ? 'text-red-600' : pt.flag === 'low' ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              {pt.value}
                            </span>
                            <span className="block text-[9px] text-slate-400 truncate max-w-[70px]">{pt.hospital}</span>
                          </div>
                        ))}
                      </div>

                      {/* Visual Progress bar connecting the points */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: '100%' }}></div>
                      </div>

                      <p className="text-[11px] text-teal-800 font-bold flex items-center space-x-1 pt-0.5">
                        <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
                        <span>Progression: Improved from {first.value} to {latest.value} {latest.unit}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Consented Cross-Hospital Timeline Records */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>{t('doctorView.consentedRecords')} ({records.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Original Files Accessible
            </span>
          </div>

          <div className="space-y-3">
            {records.map((rec) => {
              const isKem = rec.hospital.toLowerCase().includes('k.e.m') || rec.hospital.toLowerCase().includes('kem');
              const isLilavati = rec.hospital.toLowerCase().includes('lilavati');
              const isRuby = rec.hospital.toLowerCase().includes('ruby');

              const badgeColor = isLilavati 
                ? 'bg-teal-50 text-teal-800 border-teal-200' 
                : isKem 
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                : 'bg-amber-50 text-amber-900 border-amber-200';

              return (
                <div key={rec.id} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition text-xs space-y-2.5 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-500">{rec.date}</span>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full border text-xs ${badgeColor}`}>
                        {rec.hospital}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {rec.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 font-medium">{rec.doctor}</span>
                      
                      {/* Access Original Document Button (PRD 7.9) */}
                      <button
                        type="button"
                        onClick={() => handleOpenOriginalFile(rec)}
                        className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200 rounded-xl font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t('doctorView.viewOriginalFile')}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">{rec.ai_summary}</p>

                  {rec.lab_values && rec.lab_values.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rec.lab_values.map((lv, idx) => (
                        <span key={idx} className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          lv.flag === 'high' 
                            ? 'bg-red-50 text-red-800 border-red-200' 
                            : lv.flag === 'low' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <span>{lv.flag === 'high' ? '🔺' : lv.flag === 'low' ? '🔻' : '✓'}</span>
                          <span className="ml-1">{lv.test_name}: <strong>{lv.value} {lv.unit}</strong></span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Consultation Note Area (PRD Section 7.9) */}
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">{t('doctorView.addNote')}</h2>
          </div>

          <textarea
            rows="3"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('doctorView.notePlaceholder')}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              value={noteDoctor}
              onChange={(e) => setNoteDoctor(e.target.value)}
              placeholder="Doctor Name (e.g. Dr. Arvind Patil)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 w-full sm:w-72"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !noteText.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
            >
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>{t('doctorView.saveNote')}</span>
            </button>
          </div>

          {noteSaved && (
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
              ✓ Consultation note saved to patient's clinical file
            </p>
          )}
        </div>

      </div>

      {/* File Preview Modal for Doctor Portal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm truncate max-w-md">{previewFile.hospital} - {previewFile.file_name}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
              <iframe
                src={previewFile.streamUrl}
                title="Consented Medical Document"
                className="w-full h-full rounded-2xl border border-slate-200 shadow-sm bg-white"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
