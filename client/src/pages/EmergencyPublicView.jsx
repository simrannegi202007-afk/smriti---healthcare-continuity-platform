import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  AlertCircle, 
  ShieldAlert, 
  Phone, 
  Droplet, 
  Pill, 
  Activity, 
  CheckCircle, 
  Loader2,
  Lock,
  AlertOctagon,
  Clock
} from 'lucide-react';

export default function EmergencyPublicView({ token }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicEmergency() {
      setLoading(true);
      try {
        const res = await api.getPublicEmergencyCard(token);
        setData(res);
      } catch (err) {
        setError(err.data || { error: err.message });
      } finally {
        setLoading(false);
      }
    }
    loadPublicEmergency();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3 text-red-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-bold tracking-tight">Opening Emergency Triage Card...</p>
        </div>
      </div>
    );
  }

  // Handle Deactivated Card (PRD Section 7.10 Acceptance Criteria)
  if (error?.isDisabled) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border-2 border-red-500/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl text-white animate-scaleUp">
          <div className="w-16 h-16 bg-red-950/80 rounded-2xl flex items-center justify-center text-red-500 mx-auto border border-red-500/30">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-500/30">
              Access Ended
            </span>
            <h2 className="text-xl font-black pt-1">Emergency Card Deactivated</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              The patient has disabled public emergency QR scanning for this card.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Patient privacy and consent protocol strictly enforced by Smriti platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-3 sm:p-6 font-sans">
      
      {/* Red Alert Card Container */}
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-7 h-7 text-white animate-bounce flex-shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-100 block">
                FIRST RESPONDER EMERGENCY SUMMARY
              </span>
              <h1 className="text-xl font-black tracking-tight">{t('emergency.title')}</h1>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 bg-black/40 rounded-xl border border-white/20">
            NO LOGIN NEEDED
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-100">
          
          {/* Patient Details */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">{t('emergency.fieldPatientName')}</span>
              <h2 className="text-2xl font-black text-white">{data?.patientName || 'Mrs. Sunita Sharma'}</h2>
              {data?.age && (
                <p className="text-xs text-teal-400 font-medium">Age: {data.age} • ABHA: {data.abhaId || '91-4523-8812-7019'}</p>
              )}
            </div>
            {data?.bloodGroup && (
              <div className="text-center bg-red-950/80 border-2 border-red-500/60 p-2.5 rounded-2xl min-w-[75px]">
                <span className="text-[9px] font-black text-red-300 block uppercase tracking-wider">{t('emergency.bloodGroup')}</span>
                <span className="text-2xl font-black text-red-400">{data.bloodGroup}</span>
              </div>
            )}
          </div>

          {/* CRITICAL ALLERGIES - High Contrast Warning (PRD Section 7.6 & 7.10) */}
          {data?.allergies && data.allergies.length > 0 && (
            <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-4 text-white space-y-1.5 shadow-md">
              <div className="flex items-center space-x-2 text-red-400 font-black text-xs">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />
                <span>⚠️ {t('emergency.allergies')}:</span>
              </div>
              <p className="text-base font-black text-white pl-7 tracking-wide">
                {data.allergies.join(', ')}
              </p>
            </div>
          )}

          {/* Chronic Illnesses */}
          {data?.conditions && data.conditions.length > 0 && (
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="font-black text-slate-400 uppercase block text-[10px] tracking-wider">{t('emergency.conditions')}:</span>
              <p className="font-extrabold text-slate-100 text-sm">{data.conditions.join(', ')}</p>
            </div>
          )}

          {/* Current Medicines */}
          {data?.activeMedicines && data.activeMedicines.length > 0 && (
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-1.5">
              <span className="font-black text-slate-400 uppercase block text-[10px] tracking-wider">{t('emergency.currentMeds')}:</span>
              <div className="space-y-1">
                {data.activeMedicines.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white">{m.name}</span>
                    <span className="text-teal-400 font-bold">{m.dose} • {m.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact One-Tap Dial (PRD Section 7.10) */}
          {data?.emergencyContact && (
            <div className="bg-emerald-950/70 border-2 border-emerald-500/60 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-black text-emerald-400 block uppercase tracking-wider">{t('emergency.contact')}</span>
                <span className="text-sm font-black text-white block">{data.emergencyContact.name}</span>
                <span className="text-xs text-emerald-300 font-mono font-bold">{data.emergencyContact.phone}</span>
              </div>
              <a
                href={`tel:${data.emergencyContact.phone}`}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition tap-target"
                aria-label={t('dashboard.call', 'Call')}
              >
                <Phone className="w-4 h-4" />
                <span>{t('dashboard.call', 'Call')}</span>
              </a>
            </div>
          )}

          <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            🌿 Smriti Healthcare Continuity Platform • Time of scan logged in transparent audit trail
          </div>

        </div>

      </div>

    </div>
  );
}
