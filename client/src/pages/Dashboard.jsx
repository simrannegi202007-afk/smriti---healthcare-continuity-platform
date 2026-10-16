import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrendCharts from '../components/TrendCharts';
import RecordCard from '../components/RecordCard';
import { 
  UploadCloud, 
  Share2, 
  AlertCircle, 
  Clock, 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Heart,
  Droplet,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ 
  onNavigate, 
  onExplain, 
  onShare, 
  onOpenEmergency 
}) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [recentRecords, setRecentRecords] = useState([]);
  const [activeMeds, setActiveMeds] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [recRes, medRes, remRes] = await Promise.all([
          api.getRecords({ sort: 'desc' }),
          api.getMedicines(),
          api.getReminders()
        ]);
        setRecentRecords((recRes.records || []).slice(0, 5));
        setActiveMeds((medRes || []).filter(m => m.is_active === 1));
        setReminders(remRes || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleToggleReminder = async (id) => {
    try {
      await api.toggleReminder(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: r.is_completed ? 0 : 1 } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const allergies = profile?.allergies || ['Penicillin (Severe rash)', 'Sulfa Drugs'];
  const conditions = profile?.conditions || ['Type 2 Diabetes Mellitus', 'Mild Hypertension', 'Bilateral Knee Osteoarthritis'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Welcome & Quick Health Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{t('app.subtagline')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user?.name || 'Mrs. Sunita Sharma'}
            </h1>
            <p className="text-teal-200 text-xs sm:text-sm mt-1">
              {t('app.abhaNumber')} • वय: ६२ वर्षे • महाराष्ट्र
            </p>

            {/* Vitals Badges */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center space-x-1.5 font-bold">
                <Droplet className="w-3.5 h-3.5 text-red-400" />
                <span>रक्तगट: {profile?.blood_group || 'B+'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 flex items-center space-x-1.5 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>ॲलर्जी: {allergies[0]}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center space-x-1.5 font-bold">
                <Pill className="w-3.5 h-3.5 text-amber-300" />
                <span>३ चालू औषधे</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 self-stretch md:self-auto">
            <button
              onClick={() => onNavigate('upload')}
              className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1 shadow-md transition tap-target"
            >
              <UploadCloud className="w-5 h-5 text-white" />
              <span>{t('nav.upload')}</span>
            </button>
            <button
              onClick={() => onNavigate('share')}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1 shadow-md transition tap-target"
            >
              <Share2 className="w-5 h-5 text-white" />
              <span>{t('nav.share')}</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1 shadow-md transition col-span-2 sm:col-span-1 tap-target"
            >
              <AlertCircle className="w-5 h-5 text-white" />
              <span>{t('nav.emergency')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Vitals & Trends + Active Meds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Biomarker Trends (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Charts */}
          <TrendCharts />

          {/* Recent Records (5 entries) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{t('dashboard.recentRecords')}</h3>
                <p className="text-xs text-slate-500">Cross-hospital history ordered by date</p>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentRecords.map(record => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onExplain={onExplain}
                  onShare={onShare}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Health Profile, Meds & Daily Reminders */}
        <div className="space-y-6">
          
          {/* Critical Allergies & Conditions Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>{t('dashboard.allergies')}</span>
            </h3>

            <div className="space-y-2">
              {allergies.map((allergy, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs font-bold text-red-900">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{allergy}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {t('dashboard.conditions')}
              </span>
              <div className="space-y-1.5">
                {conditions.map((c, i) => (
                  <div key={i} className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    • {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Currently Taking Medicines */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <span>{t('dashboard.activeMeds')}</span>
              </h3>
              <button
                onClick={() => onNavigate('medicines')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                व्यवस्थापित करा
              </button>
            </div>

            <div className="space-y-2.5">
              {activeMeds.map(med => (
                <div key={med.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{med.name}</span>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {med.dose}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{med.frequency} • {med.timing}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medication Reminders Checklist */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-amber-950 text-base flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>आजच्या आठवणी (Reminders)</span>
            </h3>

            <div className="space-y-2">
              {reminders.map(rem => (
                <div
                  key={rem.id}
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    rem.is_completed 
                      ? 'bg-white/50 border-slate-200 text-slate-400 line-through' 
                      : 'bg-white border-amber-200 text-slate-800 font-medium shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className={`w-4 h-4 ${rem.is_completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>{rem.title}</span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-semibold">{rem.schedule_time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
