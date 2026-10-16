import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrendCharts from '../components/TrendCharts';
import RecordCard from '../components/RecordCard';
import FilePreviewModal from '../components/FilePreviewModal';
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
  Sparkles,
  Phone,
  AlertTriangle,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react';

export default function Dashboard({ 
  onNavigate, 
  onExplain, 
  onShare, 
  onOpenEmergency,
  onOpenProfile
}) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [recentRecords, setRecentRecords] = useState([]);
  const [activeMeds, setActiveMeds] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await api.deleteRecord(recordToDelete.id);
      setRecentRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setRecordToDelete(null);
      loadDashboardData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      await api.toggleReminder(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: r.is_completed ? 0 : 1 } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const allergies = profile?.allergies || ['Penicillin (Severe rash & swelling)', 'Sulfa Drugs'];
  const conditions = profile?.conditions || ['Type 2 Diabetes Mellitus (2 yrs)', 'Mild Hypertension', 'Bilateral Knee Osteoarthritis'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Patient Welcome & Quick Actions Hero (PRD 7.2) */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{t('app.subtagline')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {user?.name || 'Mrs. Sunita Sharma'}
            </h1>
            <p className="text-teal-200 text-xs sm:text-sm mt-1 font-medium">
              ABHA ID: <span className="font-mono font-bold">{user?.abha_id || '91-4523-8812-7019'}</span> • Age: 62 • Maharashtra
            </p>

            {/* Quick Vitals Badges */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center space-x-1.5 font-bold shadow-xs">
                <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>{t('healthProfile.bloodGroup')}: <strong className="text-white">{profile?.blood_group || 'B+'}</strong></span>
              </span>

              {/* Prominent Allergy Badge on Hero */}
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 flex items-center space-x-1.5 font-bold shadow-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{allergies[0] || 'Penicillin'}</span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center space-x-1.5 font-bold shadow-xs">
                <Pill className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeMeds.length} {t('dashboard.activeMeds')}</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Grid (PRD 7.2: Upload, Share, Emergency Card) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2.5 self-stretch md:self-auto">
            <button
              onClick={() => onNavigate('upload')}
              className="p-3.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 shadow-md shadow-teal-900/30 transition tap-target"
            >
              <UploadCloud className="w-5 h-5 text-white" />
              <span>{t('nav.upload')}</span>
            </button>
            <button
              onClick={() => onNavigate('share')}
              className="p-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 shadow-md shadow-blue-900/30 transition tap-target"
            >
              <Share2 className="w-5 h-5 text-white" />
              <span>{t('nav.share')}</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="p-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 shadow-md shadow-red-900/30 transition tap-target animate-pulse"
            >
              <AlertCircle className="w-5 h-5 text-white" />
              <span>{t('nav.emergency')}</span>
            </button>
            <button
              onClick={onOpenProfile}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-teal-200 border border-teal-600/40 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 shadow-md transition tap-target"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              <span>{t('healthProfile.title')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Trends + 5 Recent Records) & Right (Health Profile + Meds + Reminders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Biomarker Trends & Recent Timeline Entries (PRD 7.2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trend Charts across reports (HbA1c & Hemoglobin) */}
          <TrendCharts />

          {/* Overview of 5 most recent timeline entries with "View full history" button (PRD 7.2) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  {t('dashboard.recentRecords')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('timeline.subtitle')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs font-extrabold text-teal-700 hover:text-teal-900 flex items-center space-x-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 rounded-xl transition tap-target self-start sm:self-auto"
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
                  onPreviewFile={(rec) => setPreviewRecord(rec)}
                  onDelete={(rec) => setRecordToDelete(rec)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Health Profile (PRD 7.6) + Active Medicines & Daily Reminders */}
        <div className="space-y-6">
          
          {/* PRD Section 7.6: Health Profile Card (Blood group, allergies with prominent warning style, conditions, emergency contact) */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-black text-slate-900 text-base">
                  {t('healthProfile.title')}
                </h3>
              </div>
              <button
                onClick={onOpenProfile}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 rounded-xl transition tap-target"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('healthProfile.editButton')}</span>
              </button>
            </div>

            {/* Blood Group Display */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center space-x-2">
                <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                <span className="text-xs font-bold text-slate-700">{t('healthProfile.bloodGroup')}</span>
              </div>
              <span className="text-lg font-black text-red-600 bg-red-100 px-3 py-0.5 rounded-xl border border-red-200">
                {profile?.blood_group || 'B+'}
              </span>
            </div>

            {/* CRITICAL ALLERGIES WITH PROMINENT WARNING STYLING & ICON (PRD 7.6) */}
            <div className="bg-red-50/90 border-2 border-red-400 rounded-2xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
                <h4 className="font-black text-red-950 text-xs uppercase tracking-wider">
                  {t('dashboard.allergies')} / CRITICAL
                </h4>
              </div>

              <div className="space-y-1.5">
                {allergies.map((allergy, i) => (
                  <div 
                    key={i} 
                    className="p-2.5 bg-white border-2 border-red-500 rounded-xl flex items-center space-x-2 text-xs font-black text-red-950 shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 fill-red-100 flex-shrink-0" />
                    <span>{allergy}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-red-800 font-bold leading-tight">
                {t('healthProfile.allergyNotice')}
              </p>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t('dashboard.conditions')}
              </span>
              <div className="space-y-1.5">
                {conditions.map((c, i) => (
                  <div key={i} className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact with One-Tap Call Button */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                  {t('healthProfile.emergencyContact')}
                </span>
                <span className="font-extrabold text-slate-900 text-xs">
                  {profile?.emergency_contact_name || 'Rohan Sharma (Son)'}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  {profile?.emergency_contact_phone || '+91 98201 12345'}
                </span>
              </div>
              <a
                href={`tel:${profile?.emergency_contact_phone || '+919820112345'}`}
                className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition tap-target"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

          </div>

          {/* Currently Taking Medicines (PRD 7.2) */}
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
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {activeMeds.map(med => (
                <div key={med.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{med.name}</span>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {med.dose}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{med.frequency} • {med.timing}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Reminders Checklist (PRD 7.2 & 7.14) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-amber-950 text-base flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Upcoming Reminders</span>
            </h3>

            <div className="space-y-2">
              {reminders.map(rem => (
                <div
                  key={rem.id}
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs tap-target ${
                    rem.is_completed 
                      ? 'bg-white/50 border-slate-200 text-slate-400 line-through' 
                      : 'bg-white border-amber-200 text-slate-900 font-bold shadow-xs'
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

      {previewRecord && (
        <FilePreviewModal
          record={previewRecord}
          onClose={() => setPreviewRecord(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-red-300 animate-scaleUp space-y-4">
            
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Delete this record?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete this record? This will permanently remove the record, its uploaded file, and any linked test data or derived medicines from your timeline.
              </p>
            </div>

            {/* Record Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Hospital:</span>
                <span className="font-bold truncate max-w-[220px]">{recordToDelete.hospital}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="font-bold">{recordToDelete.date}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Category:</span>
                <span className="font-bold">{recordToDelete.category}</span>
              </div>
              {recordToDelete.doctor && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-500">Doctor:</span>
                  <span className="font-bold truncate max-w-[220px]">{recordToDelete.doctor}</span>
                </div>
              )}
              {recordToDelete.file_name && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-500">Attached File:</span>
                  <span className="font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 truncate max-w-[180px]">
                    {recordToDelete.file_name}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setRecordToDelete(null)}
                className="w-1/2 py-3 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition tap-target"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-1/2 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center space-x-1.5 tap-target"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
