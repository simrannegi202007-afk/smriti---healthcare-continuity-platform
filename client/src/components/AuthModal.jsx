import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Globe, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Loader2,
  X,
  CreditCard
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { login, register, changeLanguage, language } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  // Quick Demo Login for instant testing of preloaded 62-year-old Maharashtra patient
  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login('9820098200', 'password123');
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.data?.error || t('auth.invalidCreds'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!contact.trim()) throw new Error('Please enter mobile number or email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        await register({
          name: name.trim(),
          contact: contact.trim(),
          password,
          abha_id: abhaId.trim() || null,
          language
        });
      } else {
        await login(contact.trim(), password);
      }

      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || err.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time ABHA formatting helper (e.g., 91-4523-8812-7019 or 14 digits)
  const isAbhaValid = abhaId.replace(/\D/g, '').length === 14;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Header with Language Switcher (PRD 7.1: Language selection on first screen) */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-black tracking-tight">{t('app.name')}</span>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h2>
          <p className="text-teal-100 text-xs mt-1">
            {isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
          </p>

          {/* Prominent Language Selection Bar on First Screen */}
          <div className="mt-4 pt-3 border-t border-teal-600/60">
            <span className="text-[11px] font-bold text-teal-200 block mb-1.5 uppercase tracking-wider">
              {t('auth.selectLangPrompt')}
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-teal-900/40 p-1 rounded-2xl border border-teal-500/30">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => changeLanguage(l.code)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    language === l.code 
                      ? 'bg-white text-teal-900 shadow-sm' 
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>{l.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Quick Demo Login Option for Judges & Evaluators */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start space-x-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Demo Evaluation Shortcut
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 font-medium">
                  Log in directly as Mrs. Sunita Sharma (62 yrs, Maharashtra) with 9 preloaded records across 3 hospitals.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="mt-2.5 w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-amber-600/20 flex items-center justify-center space-x-1.5 tap-target"
                >
                  <span>{t('auth.demoButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Tabs: Sign In / Register */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition ${
                !isRegister 
                  ? 'border-teal-600 text-teal-800' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('auth.loginTab')}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition ${
                isRegister 
                  ? 'border-teal-600 text-teal-800' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('auth.registerTab')}
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Registration: Full Name */}
            {isRegister && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('auth.fullName')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 tap-target"
                  />
                </div>
              </div>
            )}

            {/* Mobile / Email */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.contact')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t('auth.contactPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 tap-target"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 tap-target"
                />
              </div>
            </div>

            {/* Optional 14-digit ABHA ID Field (PRD 7.1) */}
            {isRegister && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t('auth.abhaField')}</span>
                  </label>
                  {isAbhaValid && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{t('auth.abhaBadge')}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder={t('auth.abhaPlaceholder')}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('auth.abhaHelp')}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 tap-target text-xs sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegister ? t('auth.registering') : t('auth.loggingIn')}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? t('auth.registerButton') : t('auth.signInButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Tab Prompt */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
            >
              {isRegister ? t('auth.switchLogin') : t('auth.switchRegister')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
