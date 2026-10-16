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
  Lock
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
          <p className="text-sm font-bold">Opening Emergency Triage Card...</p>
        </div>
      </div>
    );
  }

  if (error?.isDisabled) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-8 max-w-sm w-full text-center space-y-3 shadow-lg">
          <Lock className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Emergency Card Deactivated</h2>
          <p className="text-xs text-slate-500">The patient has deactivated public emergency scanning for this card.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      
      {/* Red Alert Card Container */}
      <div className="max-w-md w-full bg-slate-800 border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Urgent Header */}
        <div className="bg-red-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-6 h-6 animate-bounce" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-100 block">
                FIRST RESPONDER EMERGENCY SUMMARY
              </span>
              <h1 className="text-xl font-black">आपातकालीन मेडिकल कार्ड</h1>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-black/30 rounded-lg">
            NO LOGIN NEEDED
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-slate-100">
          
          {/* Patient Details */}
          <div className="flex items-start justify-between border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">PATIENT NAME</span>
              <h2 className="text-2xl font-black text-white">{data?.patientName || 'Mrs. Sunita Sharma'}</h2>
              <p className="text-xs text-teal-400 font-medium">ABHA ID: {data?.abhaId || '91-4523-8812-7019'}</p>
            </div>
            {data?.bloodGroup && (
              <div className="text-center bg-red-950/70 border border-red-500/50 p-2.5 rounded-2xl">
                <span className="text-[10px] font-bold text-red-300 block">BLOOD</span>
                <span className="text-2xl font-black text-red-400">{data.bloodGroup}</span>
              </div>
            )}
          </div>

          {/* CRITICAL ALLERGIES - High Contrast Warning */}
          {data?.allergies && data.allergies.length > 0 && (
            <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-4 text-white space-y-1">
              <div className="flex items-center space-x-2 text-red-400 font-black text-xs">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <span>⚠️ CRITICAL ALLERGIES / गंभीर ॲलर्जी:</span>
              </div>
              <p className="text-base font-black text-white pl-7">
                {data.allergies.join(', ')}
              </p>
            </div>
          )}

          {/* Conditions & Current Meds */}
          <div className="space-y-3 text-xs">
            {data?.conditions && (
              <div className="bg-slate-700/60 p-3.5 rounded-2xl border border-slate-600">
                <span className="font-bold text-slate-400 uppercase block mb-1">CHRONIC ILLNESSES:</span>
                <p className="font-semibold text-slate-200">{data.conditions.join(', ')}</p>
              </div>
            )}

            {data?.activeMedicines && (
              <div className="bg-slate-700/60 p-3.5 rounded-2xl border border-slate-600">
                <span className="font-bold text-slate-400 uppercase block mb-1">CURRENT MEDICINES:</span>
                <p className="font-semibold text-slate-200">
                  {data.activeMedicines.map(m => `${m.name} (${m.dose})`).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Emergency Contact One-Tap Dial */}
          {data?.emergencyContact && (
            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">EMERGENCY CONTACT</span>
                <span className="text-sm font-bold text-white">{data.emergencyContact.name}</span>
                <span className="text-xs text-emerald-300 block">{data.emergencyContact.phone}</span>
              </div>
              <a
                href={`tel:${data.emergencyContact.phone}`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call SOS</span>
              </a>
            </div>
          )}

          <div className="text-center text-[11px] text-slate-400 pt-2">
            🌿 Smriti Healthcare Continuity Platform • India
          </div>

        </div>

      </div>

    </div>
  );
}
