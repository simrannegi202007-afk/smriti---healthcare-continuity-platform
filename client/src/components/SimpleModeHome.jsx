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
  Heart
} from 'lucide-react';

export default function SimpleModeHome({ 
  onNavigate, 
  onOpenEmergency, 
  onOpenVoice 
}) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

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
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-teal-200 text-sm font-semibold mb-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <span>{t('app.subtagline')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t('simpleMode.welcome')}
          </h1>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl">
            {t('app.tagline')} तुमच्या सर्व रुग्णालयांचे रिपोर्ट, डॉक्टरांची प्रिस्क्रिप्शन आणि औषधे एकाच सुरक्षित ठिकाणी.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="bg-teal-900/60 backdrop-blur border border-teal-500/40 px-3 py-1.5 rounded-full font-medium">
              🩸 रक्तगट: <strong className="text-white">B+</strong>
            </span>
            <span className="bg-red-900/50 backdrop-blur border border-red-400/40 px-3 py-1.5 rounded-full font-medium text-red-200">
              ⚠️ ॲलर्जी: <strong className="text-white">Penicillin</strong>
            </span>
            <span className="bg-teal-900/60 backdrop-blur border border-teal-500/40 px-3 py-1.5 rounded-full font-medium">
              💊 चालू औषधे: <strong className="text-white">३ औषधे</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Hero 4 Big Accessible Buttons */}
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
                <p className="text-slate-600 mt-2 text-sm sm:text-base font-medium leading-snug">
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Medicines Quick Reminder Bar */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t('dashboard.activeMeds')}
            </h3>
            <p className="text-xs text-slate-500">
              Metformin 500mg (दुपारी/रात्री) • Telmisartan 40mg (सकाळी)
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('medicines')}
          className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl border border-teal-200 transition tap-target flex items-center space-x-1"
        >
          <span>सर्व औषधे पहा</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
