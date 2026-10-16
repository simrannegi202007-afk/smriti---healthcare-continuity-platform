import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Mic, 
  Pill, 
  ShieldCheck, 
  ChevronRight,
  Heart,
  Droplet,
  ShieldAlert,
  Edit2
} from 'lucide-react';

export default function SimpleModeHome({ 
  onNavigate, 
  onOpenEmergency, 
  onOpenVoice,
  onOpenProfile
}) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const allergies = profile?.allergies || ['Penicillin (Severe rash)', 'Sulfa Drugs'];

  const cards = [
    {
      id: 'upload',
      title: t('simpleMode.uploadTitle'),
      desc: t('simpleMode.uploadDesc'),
      icon: UploadCloud,
      color: 'from-teal-500 to-emerald-600',
      bgColor: 'bg-teal-50/80',
      borderColor: 'border-teal-300',
      textColor: 'text-teal-900',
      iconBg: 'bg-teal-600',
      action: () => onNavigate('upload')
    },
    {
      id: 'timeline',
      title: t('simpleMode.reportsTitle'),
      desc: t('simpleMode.reportsDesc'),
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      iconBg: 'bg-blue-600',
      action: () => onNavigate('timeline')
    },
    {
      id: 'emergency',
      title: t('simpleMode.emergencyTitle'),
      desc: t('simpleMode.emergencyDesc'),
      icon: AlertCircle,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50/80',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      iconBg: 'bg-red-600',
      action: onOpenEmergency
    },
    {
      id: 'voice',
      title: t('simpleMode.assistantTitle'),
      desc: t('simpleMode.assistantDesc'),
      icon: Mic,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-900',
      iconBg: 'bg-amber-600',
      action: onOpenVoice
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Friendly Greeting Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold mb-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{t('app.subtagline')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            {t('simpleMode.welcome')}
          </h1>
          <p className="text-teal-100 text-xs sm:text-base max-w-xl font-medium">
            {t('app.tagline')} Cross-hospital records, doctor prescriptions, and plain-language report explanations in one safe place.
          </p>

          {/* Vitals & Health Profile Chips (PRD 7.6) */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={onOpenProfile}
              className="bg-teal-950/70 hover:bg-teal-900 backdrop-blur border border-teal-500/40 px-3.5 py-2 rounded-2xl font-bold flex items-center space-x-1.5 transition tap-target"
            >
              <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>{t('healthProfile.bloodGroup')}: <strong className="text-white">{profile?.blood_group || 'B+'}</strong></span>
            </button>

            {/* Prominent Allergy Warning Badge */}
            <button
              onClick={onOpenProfile}
              className="bg-rose-950/80 hover:bg-rose-900 backdrop-blur border-2 border-rose-500 px-3.5 py-2 rounded-2xl font-black text-rose-200 flex items-center space-x-1.5 transition tap-target animate-pulse"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>⚠️ {t('dashboard.allergies')}: <strong className="text-white">{allergies[0] || 'Penicillin'}</strong></span>
            </button>

            <button
              onClick={onOpenProfile}
              className="bg-teal-950/70 hover:bg-teal-900 backdrop-blur border border-teal-500/40 px-3 py-2 rounded-2xl font-bold text-teal-200 flex items-center space-x-1 transition tap-target"
            >
              <Edit2 className="w-3 h-3" />
              <span>{t('healthProfile.editButton')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero 4 Big Accessible Buttons (PRD 7.13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={c.action}
              className={`text-left p-6 sm:p-8 rounded-3xl border-2 ${c.borderColor} ${c.bgColor} hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-xl flex items-start space-x-5 group tap-target`}
            >
              <div className={`w-16 h-16 rounded-2xl ${c.iconBg} text-white flex-shrink-0 flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl sm:text-2xl font-black ${c.textColor}`}>
                    {c.title}
                  </h2>
                  <ChevronRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-700 transition" />
                </div>
                <p className="text-slate-600 mt-2 text-xs sm:text-sm font-semibold leading-snug">
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Medicines Quick Reminder Bar */}
      <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {t('dashboard.activeMeds')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Metformin 500mg • Telmisartan 40mg • Calcium + Vitamin D3
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('medicines')}
          className="text-xs font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-2xl border border-teal-200 transition tap-target flex items-center space-x-1"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
