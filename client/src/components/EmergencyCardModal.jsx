import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  AlertCircle, 
  Printer, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Phone, 
  Heart,
  Droplet,
  Pill,
  Activity
} from 'lucide-react';

export default function EmergencyCardModal({ onClose }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [emergencyCard, setEmergencyCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmergency() {
      try {
        const res = await api.getMyEmergencyCard();
        setEmergencyCard(res);
      } catch (err) {
        console.error('Failed to get emergency card:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmergency();
  }, []);

  const token = emergencyCard?.token || 'emergency-sunita-sharma';
  const publicUrl = `${window.location.origin}/emergency/${token}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const allergies = profile?.allergies || ['Penicillin (Severe rash)', 'Sulfa drugs'];
  const conditions = profile?.conditions || ['Type 2 Diabetes Mellitus', 'Mild Hypertension'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('emergency.title')}</h2>
              <p className="text-xs text-red-100">{t('emergency.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Life-Saving Physical Card Preview */}
          <div className="border-2 border-red-500 rounded-3xl p-5 bg-gradient-to-br from-red-50/50 via-white to-rose-50/40 shadow-md space-y-4">
            
            {/* Patient Header */}
            <div className="flex items-start justify-between border-b border-red-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">EMERGENCY MEDICAL CARD</span>
                <h3 className="text-xl font-black text-slate-900">{user?.name || 'Mrs. Sunita Sharma'}</h3>
                <p className="text-xs text-slate-500">ABHA: 91-4523-8812-7019 • Age: 62</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block">BLOOD GROUP</span>
                <span className="text-2xl font-black text-red-600 px-3 py-0.5 bg-red-100 rounded-xl inline-block border border-red-200">
                  {profile?.blood_group || 'B+'}
                </span>
              </div>
            </div>

            {/* Critical Allergies - Highlighted with Warning style */}
            <div className="bg-red-100 border border-red-300 rounded-2xl p-3 text-red-950 flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-800">
                  CRITICAL ALLERGIES / गंभीर ॲलर्जी:
                </span>
                <p className="text-sm font-bold text-red-900 mt-0.5">
                  {allergies.join(', ')}
                </p>
              </div>
            </div>

            {/* Chronic Conditions & Current Meds */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block mb-1">CHRONIC CONDITIONS:</span>
                <p className="font-semibold text-slate-800">{conditions.join(', ')}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block mb-1">CURRENT MEDICINES:</span>
                <p className="font-semibold text-slate-800">Metformin 500mg, Telmisartan 40mg</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-800 block">EMERGENCY CONTACT:</span>
                <span className="font-bold text-slate-900">{profile?.emergency_contact_name || 'Rohan Sharma (Son)'}</span>
              </div>
              <a
                href={`tel:${profile?.emergency_contact_phone || '+919820112345'}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>

            {/* Printable QR Code section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
              <div className="flex items-center space-x-3">
                <img
                  src={qrImageSrc}
                  alt="Emergency Medical QR"
                  className="w-24 h-24 rounded-xl border border-slate-300 p-1 bg-white shadow-sm"
                />
                <div className="text-xs text-slate-600 max-w-[200px]">
                  <p className="font-bold text-slate-900 mb-0.5">Scan without login</p>
                  <p className="text-[11px] leading-tight text-slate-500">
                    Responders and ER doctors scan this QR with any phone to view critical health data in under 3 seconds.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('emergency.printCard')}</span>
                </button>
                <a
                  href={`/emergency/${token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <span>Test Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
