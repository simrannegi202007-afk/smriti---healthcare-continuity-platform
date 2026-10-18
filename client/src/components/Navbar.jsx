import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
  ChevronDown, 
  LogIn,
  Bot
} from 'lucide-react';

export default function Navbar({ 
  onOpenEmergency, 
  onOpenVoice, 
  onOpenProfile, 
  onOpenAuth,
  onOpenChatbot,
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

  const langRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setLangDropdownOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Activity },
    { id: 'timeline', label: t('nav.timeline'), icon: Clock },
    { id: 'trends', label: t('nav.trends'), icon: TrendingUp },
    { id: 'upload', label: t('nav.upload'), icon: FileText },
    { id: 'medicines', label: t('nav.medicines'), icon: Pill },
    { id: 'share', label: t('nav.share'), icon: Share2 },
    { id: 'access-log', label: t('nav.accessLog'), icon: ShieldCheck }
  ];

  // Chatbot nav action (not a tab, opens modal)
  const chatbotNavItem = { label: t('chatbot.navLink'), icon: Bot, action: onOpenChatbot };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm w-full max-w-full">
      {/* Top Banner / ABHA Status Strip - wraps cleanly without clipping */}
      <div className="w-full bg-teal-800 text-white px-3 sm:px-6 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            {t('app.abhaLinked')}
          </span>
          <span className="hidden sm:inline text-teal-100 font-mono text-[11px] truncate max-w-[200px]">
            {user?.abha_id || t('app.abhaNumber')}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-teal-100 text-[11px] truncate">
          <span className="font-semibold truncate">{user?.name ? `${user.name} (62 yrs, Maharashtra)` : t('app.demoPatient')}</span>
        </div>
      </div>

      {/* Main Navbar Container */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between min-h-[4rem] py-1.5 gap-2 w-full">
          
          {/* Brand: Logo, Name, and Tagline */}
          <div 
            className="flex flex-col justify-center flex-shrink-0 cursor-pointer select-none py-1 mr-1 sm:mr-3" 
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Row 1: Logo and Name */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <span className="text-lg sm:text-xl leading-none">🌿</span>
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {t('app.name')}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200 hidden lg:inline leading-none">
                {language === 'mr' ? 'स्मृती' : language === 'hi' ? 'स्मृति' : 'Health Continuity'}
              </span>
            </div>
            
            {/* Row 2: Tagline under logo */}
            <div className="mt-0.5 pl-0.5 hidden md:block">
              <p className="text-[11px] font-bold text-teal-700 tracking-wide leading-tight whitespace-nowrap truncate max-w-[210px]">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links - Shown on extra large screens */}
          <nav className="hidden 2xl:flex items-center space-x-1 flex-shrink">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 font-extrabold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
            {/* Chatbot nav link */}
            <button
              onClick={onOpenChatbot}
              aria-label={chatbotNavItem.label}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200"
            >
              <Bot className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span className="whitespace-nowrap">{chatbotNavItem.label}</span>
              <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1 rounded-full leading-tight">AI</span>
            </button>
          </nav>

          {/* Controls: Mode Toggle, Font Size, Language, Profile, Emergency SOS */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 flex-shrink ml-auto">
            
            {/* Simple Mode / Detailed Mode Toggle */}
            <button
              onClick={toggleSimpleMode}
              title="Toggle between Simple and Detailed View"
              aria-label={simpleMode ? t('nav.standardMode') : t('nav.simpleMode')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition shadow-xs ${
                simpleMode 
                  ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/30' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
              <span className="hidden md:inline">{simpleMode ? t('nav.simpleMode') : t('nav.standardMode')}</span>
              <span className="md:hidden">{simpleMode ? 'Simple' : 'Full'}</span>
            </button>

            {/* Font Size A- / A / A+ */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs shadow-xs">
              <button
                onClick={() => updateFontSize('sm')}
                className={`px-2 py-1 rounded-lg font-bold transition text-xs ${fontSize === 'sm' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600 hover:text-slate-900'}`}
                title="Small text"
                aria-label="Small text size"
              >
                A-
              </button>
              <button
                onClick={() => updateFontSize('md')}
                className={`px-2 py-1 rounded-lg font-bold transition text-xs ${fontSize === 'md' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600 hover:text-slate-900'}`}
                title="Standard text"
                aria-label="Standard text size"
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('lg')}
                className={`px-2 py-1 rounded-lg font-black transition text-xs ${fontSize === 'lg' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600 hover:text-slate-900'}`}
                title="Large text for seniors"
                aria-label="Large text size"
              >
                A+
              </button>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs"
                title="Change Language"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
                <span>{language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 py-1.5 z-[100] animate-scaleUp">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition ${
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
              title={t('healthProfile.title')}
              aria-label={t('healthProfile.title')}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-900 text-xs font-bold transition shadow-xs"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
              <span className="hidden lg:inline">{t('healthProfile.title')}</span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                title="Account Settings"
                aria-label="Account Settings"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 flex-shrink-0" />
                <span className="hidden xl:inline">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:inline" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-[100] animate-scaleUp text-xs space-y-1">
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

            {/* Emergency SOS Button - Never gets cut off */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black shadow-md shadow-red-500/25 transition flex-shrink-0 animate-pulse"
              title="Open Life-Saving Emergency Card & QR"
              aria-label={t('nav.emergency')}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('nav.emergency')}</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Mobile / Tablet Menu Hamburger (on screens < 2xl) */}
            <div className="2xl:hidden flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu - Includes all navigation links, font-size toggle, and simple mode */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-scaleUp">
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
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
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                    isActive ? 'bg-teal-50 text-teal-800 font-extrabold border border-teal-200' : 'text-slate-700 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
            {/* Chatbot in mobile drawer */}
            <button
              onClick={() => { onOpenChatbot(); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
            >
              <Bot className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{t('chatbot.navLink')}</span>
              <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1 rounded-full leading-tight">AI</span>
            </button>
          </div>

          {/* Mobile Drawer Settings: Font Size and Mode */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">Font Size:</span>
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs shadow-xs">
              <button
                onClick={() => updateFontSize('sm')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${fontSize === 'sm' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600'}`}
                aria-label="Small font size"
              >
                A-
              </button>
              <button
                onClick={() => updateFontSize('md')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${fontSize === 'md' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600'}`}
                aria-label="Standard font size"
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('lg')}
                className={`px-3 py-1.5 rounded-lg font-black transition text-xs ${fontSize === 'lg' ? 'bg-white shadow text-teal-800 font-black' : 'text-slate-600'}`}
                aria-label="Large font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
