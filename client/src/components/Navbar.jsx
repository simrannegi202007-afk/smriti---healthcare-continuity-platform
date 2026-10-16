import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Globe, 
  AlertCircle, 
  Type, 
  Mic, 
  Menu, 
  X, 
  Layers, 
  Heart, 
  Activity,
  FileText,
  Clock,
  LogOut,
  Pill,
  Share2,
  User,
  ChevronDown,
  LogIn
} from 'lucide-react';

export default function Navbar({ 
  onOpenEmergency, 
  onOpenVoice, 
  onOpenProfile, 
  onOpenAuth,
  activeTab, 
  setActiveTab 
}) {
  const { t } = useTranslation();
  const { 
    user, 
    profile, 
    isLoggedIn, 
    simpleMode, 
    toggleSimpleMode, 
    fontSize, 
    updateFontSize, 
    language, 
    changeLanguage, 
    logout 
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Activity },
    { id: 'timeline', label: t('nav.timeline'), icon: Clock },
    { id: 'upload', label: t('nav.upload'), icon: FileText },
    { id: 'medicines', label: t('nav.medicines'), icon: Pill },
    { id: 'share', label: t('nav.share'), icon: Share2 },
    { id: 'access-log', label: t('nav.accessLog'), icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner / ABHA Status Strip */}
      <div className="bg-teal-800 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {t('app.abhaLinked')}
          </span>
          <span className="hidden sm:inline text-teal-100 font-mono text-[11px]">
            {user?.abha_id || t('app.abhaNumber')}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-teal-100 text-[11px]">
          <span className="font-semibold">{user?.name ? `${user.name} (62 yrs, Maharashtra)` : t('app.demoPatient')}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline (Smriti: Your health, remembered.) */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none tap-target" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25 flex-shrink-0">
              <span className="text-2xl sm:text-3xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {t('app.name')}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200 hidden sm:inline">
                  {language === 'mr' ? 'स्मृती' : language === 'hi' ? 'स्मृति' : 'Health Continuity'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-teal-700 -mt-0.5">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all tap-target ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 font-extrabold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Mode Toggle, Font Size, Language, Profile, Emergency */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Simple Mode / Detailed Mode Toggle */}
            <button
              onClick={toggleSimpleMode}
              title="Toggle between Simple and Detailed View"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition shadow-xs tap-target ${
                simpleMode 
                  ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/30' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">{simpleMode ? t('nav.simpleMode') : t('nav.standardMode')}</span>
              <span className="md:hidden">{simpleMode ? 'Simple' : 'Full'}</span>
            </button>

            {/* Font Size A- / A / A+ */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50 text-xs shadow-xs">
              <button
                onClick={() => updateFontSize('sm')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition tap-target ${fontSize === 'sm' ? 'bg-white shadow text-teal-800' : 'text-slate-600 hover:text-slate-900'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => updateFontSize('md')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition tap-target ${fontSize === 'md' ? 'bg-white shadow text-teal-800' : 'text-slate-600 hover:text-slate-900'}`}
                title="Standard text"
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('lg')}
                className={`px-2.5 py-1.5 rounded-xl font-black transition tap-target ${fontSize === 'lg' ? 'bg-white shadow text-teal-800' : 'text-slate-600 hover:text-slate-900'}`}
                title="Large text for seniors"
              >
                A+
              </button>
            </div>

            {/* Language Switcher Dropdown (on every page) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs tap-target"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span>{language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'English'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-scaleUp">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-teal-50 transition tap-target ${
                        language === l.code ? 'font-black text-teal-800 bg-teal-50/60' : 'text-slate-700 font-semibold'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <span className="text-teal-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Health Profile Button (PRD 7.6) */}
            <button
              onClick={onOpenProfile}
              title="View & Edit Health Profile (Blood group, allergies, conditions)"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-900 text-xs font-bold transition tap-target shadow-xs"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">{t('healthProfile.title')}</span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 tap-target"
                title="Account Settings & Switch Patient"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-scaleUp text-xs space-y-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-extrabold text-slate-900">{user?.name || 'Mrs. Sunita Sharma'}</p>
                    <p className="text-[11px] text-slate-500">{user?.contact || '9820098200'}</p>
                    <p className="text-[10px] text-teal-700 font-bold mt-0.5">ABHA: {user?.abha_id || '91-4523-8812-7019'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-4 py-2.5 font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{t('healthProfile.editTitle')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-4 py-2.5 font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2"
                  >
                    <LogIn className="w-4 h-4 text-teal-600" />
                    <span>Sign In / Switch Patient</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      onOpenAuth();
                    }}
                    className="w-full text-left px-4 py-2.5 font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black shadow-md shadow-red-500/25 transition tap-target animate-pulse"
              title="Open Life-Saving Emergency Card & QR"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.emergency')}</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <div className="xl:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 tap-target"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold tap-target ${
                  isActive ? 'bg-teal-50 text-teal-800 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
